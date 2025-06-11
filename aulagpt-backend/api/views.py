# api/views.py
from rest_framework import viewsets, status, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView

from django.db import connection
import time
import traceback

from .models import User, Documents, Tests, TestQuestion, TestAnswer, Activity, ChatHistory
from .serializers import (
    RegisterSerializer, UserSerializer, DocumentsSerializer,
    TestsSerializer, TestQuestionSerializer, TestAnswerSerializer, ActivitySerializer
)

from .google_drive.utils import (
    obtener_carpeta_asignatura,
    obtener_o_crear_subcarpeta_usuario,
    subir_archivo_drive
)

from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer  # ya que está todo en serializers.py

# Import OpenAI
import openai
from django.conf import settings  # Import settings to access API key
import os


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


# --- Ping DB ---
@api_view(['GET'])
@permission_classes([AllowAny])
def ping_db(request):
    start = time.time()
    try:
        connection.ensure_connection()
        db_status = "OK"
    except Exception as e:
        db_status = f"ERROR: {e}"
    elapsed = time.time() - start
    return Response({"db_status": db_status, "elapsed": elapsed})


# --- Vista protegida ---
class MiVistaProtegida(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"mensaje": f"Hola, {request.user.username}"})


# --- User Management ---
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def get_serializer_class(self):
        if self.action == 'register':
            return RegisterSerializer
        return UserSerializer

    @action(detail=False, methods=['post'], url_path='register')
    def register(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "Registro exitoso",
                "id": user.id,
                "email": user.email,
                "role": user.role
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='login')
    def login(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)

        if user.check_password(password):
            return Response({
                "message": "Login exitoso",
                "id": user.id
            })
        else:
            return Response({"error": "Contraseña incorrecta"}, status=status.HTTP_401_UNAUTHORIZED)

class DocumentsViewSet(viewsets.ModelViewSet):
    queryset = Documents.objects.all()
    serializer_class = DocumentsSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]  # Para subir archivos

    def create(self, request, *args, **kwargs):
        usuario = request.user
        archivo = request.FILES.get('file')
        asignatura = request.data.get('subject')  # Aquí usas 'subject'

        if not archivo or not asignatura:
            return Response(
                {'error': 'El archivo y la asignatura son obligatorios.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Obtienes la carpeta correspondiente a la asignatura
            carpeta_asignatura_id = obtener_carpeta_asignatura(asignatura)
            # Obtienes o creas la subcarpeta para el usuario dentro de la asignatura
            carpeta_usuario_id = obtener_o_crear_subcarpeta_usuario(carpeta_asignatura_id, usuario.id)
            # Subes el archivo a Drive y obtienes el enlace
            enlace_drive = subir_archivo_drive(archivo, carpeta_usuario_id)

            # Creas el documento con 'subject'
            nuevo_documento = Documents.objects.create(
                owner=usuario,
                subject=asignatura,
                file_name=archivo.name,
                file_type=archivo.content_type,
                drive_link=enlace_drive
            )

            serializer = self.get_serializer(nuevo_documento)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- Tests y actividad ---
class TestsViewSet(viewsets.ModelViewSet):
    queryset = Tests.objects.all()
    serializer_class = TestsSerializer
    permission_classes = [permissions.IsAuthenticated]


class TestQuestionViewSet(viewsets.ModelViewSet):
    queryset = TestQuestion.objects.all()
    serializer_class = TestQuestionSerializer
    permission_classes = [permissions.IsAuthenticated]


class TestAnswerViewSet(viewsets.ModelViewSet):
    queryset = TestAnswer.objects.all()
    serializer_class = TestAnswerSerializer
    permission_classes = [permissions.IsAuthenticated]


class ActivityViewSet(viewsets.ModelViewSet):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer
    permission_classes = [permissions.IsAuthenticated]


class AskAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        question = request.data.get('question')
        subject_id = request.data.get('subject')
        action = request.data.get('action', 'answer')

        if not question or not subject_id:
            return Response(
                {"error": "Faltan campos requeridos (question o subject)"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            subject = Class.objects.get(class_id=subject_id)
        except Class.DoesNotExist:
            return Response(
                {"error": "Asignatura no encontrada"},
                status=status.HTTP_404_NOT_FOUND
            )

        system_prompt = (
            "Eres **AulaGPT**, un asistente educativo para la asignatura "
            f"{subject.class_name}. Tu conocimiento se basa únicamente en los "
            "documentos que el usuario ha subido.\n\n"
            "Reglas de respuesta:\n"
            "1. **Explicaciones**: claras y concisas, pasos numerados si hay varios.\n"
            "2. **Resúmenes**: máximo 5 viñetas.\n"
            "3. **Tests** (si action=='answer' y se piden tests): genera preguntas "
            "de opción múltiple A–D y devuelve un JSON con campos "
            "[{\"question\":…, \"options\":[…], \"correct\":\"B\"},…].\n"
            "4. **Tono**: amigable y profesional.\n"
            "5. **Límites**: no inventes nada fuera de los documentos subidos.\n"
        )

        try:
            openai.api_key = settings.OPENAI_API_KEY

            completion = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": question}
                ]
            )
            answer_text = completion.choices[0].message["content"].strip()

            ChatHistory.objects.create(
                user=request.user,
                subject=subject,
                question=question,
                response=answer_text
            )

            Activity.objects.create(
                user=request.user,
                subject=subject,
                activity_type='summary' if action == 'summary' else 'answer'
            )

            return Response({
                "question": question,
                "answer": answer_text
            }, status=status.HTTP_200_OK)

        except Exception as e:
            traceback.print_exc()
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
