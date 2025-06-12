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

from django.conf import settings
import openai
import os

from .models import (
    User,
    Documents,
    Tests,
    TestQuestion,
    TestAnswer,
    Activity,
    ChatHistory
)
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    DocumentsSerializer,
    TestsSerializer,
    TestQuestionSerializer,
    TestAnswerSerializer,
    ActivitySerializer,
    CustomTokenObtainPairSerializer
)
from rest_framework_simplejwt.views import TokenObtainPairView

from .google_drive.utils import (
    obtener_carpeta_asignatura,
    obtener_o_crear_subcarpeta_usuario,
    subir_archivo_drive,
    extraer_texto_de_documentos_usuario
)


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
        subject  = request.data.get('subject')
        action   = request.data.get('action', 'answer')

        if not question or not subject:
            return Response({"error": "Faltan campos requeridos"}, status=400)

        # Extraemos los PDFs como antes...
        context_text = extraer_texto_de_documentos_usuario(subject, request.user.id)
        if not context_text.strip():
            return Response({"error": "No se pudo extraer texto de los documentos"}, status=400)

        # --- Aquí diferenciamos acciones ---
        if action == 'test':
            system_prompt = (
                f"Eres AulaGPT, un generador de tests interactivos para la asignatura {subject}.\n"
                f"Usa exclusivamente el siguiente contenido:\n\n{context_text[:8000]}\n\n"
                "Genera un test con 5 preguntas de opción múltiple. Para cada pregunta, incluye:\n"
                "- El enunciado como 'question'\n"
                "- Cuatro opciones como una lista en 'options'\n"
                "- La opción correcta como 'correct' (una letra: A, B, C o D)\n\n"
                "Devuelve SOLO un JSON con este formato (sin explicaciones ni texto extra):\n"
                "[\n"
                "  {\n"
                "    \"question\": \"¿Cuál es el resultado de 2+2?\",\n"
                "    \"options\": [\"1\", \"2\", \"3\", \"4\"],\n"
                "    \"correct\": \"D\"\n"
                "  },\n"
                "  ...\n"
                "]"
            )
        elif action == 'summary':
            system_prompt = (
                f"Eres **AulaGPT**, un generador de resúmenes para {subject}.\n"
                f"Usa SOLO este contenido:\n\n{context_text[:8000]}\n\n"
                "Devuélveme un resumen en máximo 5 viñetas."
            )
        else:
            system_prompt = (
                f"Eres **AulaGPT**, un asistente educativo para {subject}.\n"
                f"Usa SOLO este contenido:\n\n{context_text[:8000]}\n\n"
                "Responde a la pregunta de forma clara y concisa."
            )
        # -----------------------------------

        # Llamada a OpenAI (versión clásica)
        openai.api_key = settings.OPENAI_API_KEY
        try:
            completion = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user",   "content": question}
                ]
            )
            respuesta = completion.choices[0].message.content.strip()
        except Exception as e:
            return Response({"error": f"Fallo en OpenAI: {e}"}, status=500)

        # Guardar en historial...
        ChatHistory.objects.create(
            user=request.user,
            subject=subject,
            question=question,
            response=respuesta
        )
        return Response({"question": question, "answer": respuesta})
