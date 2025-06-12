from rest_framework import viewsets, status, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView

from django.db import connection
from django.conf import settings
from django.utils import timezone
import time
import traceback
import openai
import os
import json
import re

from .models import (
    User, Documents, Tests, TestQuestion, TestAnswer,
    Activity, ChatHistory, StudentTeacher, Progress
)
from .serializers import (
    RegisterSerializer, UserSerializer, DocumentsSerializer,
    TestsSerializer, TestQuestionSerializer, TestAnswerSerializer,
    ActivitySerializer, ChatHistorySerializer,
    CustomTokenObtainPairSerializer, StudentTeacherSerializer, 
    ProgressSerializer
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .google_drive.utils import (
    obtener_carpeta_asignatura,
    obtener_o_crear_subcarpeta_usuario,
    subir_archivo_drive,
    extraer_texto_de_documentos_usuario,
    eliminar_archivo_drive
)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


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


class MiVistaProtegida(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"mensaje": f"Hola, {request.user.username}"})


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

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
                "username": user.username,
                "email": user.email,
                "role": user.role
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='login')
    def login(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        if not username or not password:
            return Response({"error": "Debe incluir 'username' y 'password'"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(username__iexact=username)
        except User.DoesNotExist:
            return Response({"error": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        if user.check_password(password):
            return Response({"message": "Login exitoso", "id": user.id})
        return Response({"error": "Contraseña incorrecta"}, status=status.HTTP_401_UNAUTHORIZED)


class DocumentsViewSet(viewsets.ModelViewSet):
    queryset = Documents.objects.all()
    serializer_class = DocumentsSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        # Mostrar solo documentos del usuario autenticado
        return Documents.objects.filter(owner=self.request.user).order_by("-upload_date")

    def create(self, request, *args, **kwargs):
        usuario = request.user
        archivo = request.FILES.get('file')
        asignatura = request.data.get('subject')

        if not archivo or not asignatura:
            return Response(
                {'error': 'El archivo y la asignatura son obligatorios.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            carpeta_id = obtener_carpeta_asignatura(asignatura)
            subcarpeta = obtener_o_crear_subcarpeta_usuario(carpeta_id, usuario.id)
            enlace = subir_archivo_drive(archivo, subcarpeta)

            doc = Documents.objects.create(
                owner=usuario,
                subject=asignatura,
                file_name=archivo.name,
                file_type=archivo.content_type,
                drive_link=enlace
            )

            serializer = self.get_serializer(doc)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=["post"], url_path="delete-selected")
    def delete_selected(self, request):
        ids = request.data.get("ids", [])
        if not isinstance(ids, list) or not ids:
            return Response(
                {"error": "Debes enviar una lista de IDs en 'ids'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        documentos = Documents.objects.filter(id__in=ids, owner=request.user)

        if not documentos.exists():
            return Response(
                {"error": "No se encontraron documentos válidos para eliminar."},
                status=status.HTTP_404_NOT_FOUND
            )

        eliminados = []
        errores = []

        for doc in documentos:
            try:
                eliminar_archivo_drive(doc.drive_link)
                eliminados.append(doc.id)
                doc.delete()
            except Exception as e:
                errores.append({"id": doc.id, "error": str(e)})

        return Response({
            "eliminados": eliminados,
            "errores": errores
        }, status=status.HTTP_200_OK)

class TestsViewSet(viewsets.ModelViewSet):
    queryset = Tests.objects.all()
    serializer_class = TestsSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'], url_path='submit')
    def submit_answers(self, request):
        subject = request.data.get('subject')
        answers = request.data.get('answers')
        if not subject or not answers:
            return Response({"error": "Faltan datos"}, status=status.HTTP_400_BAD_REQUEST)
        test = Tests.objects.filter(
            creator=request.user,
            test_name__icontains=subject
        ).order_by('-creation_date').first()
        if not test:
            return Response({"error": "No se encontró un test para esa asignatura."}, status=status.HTTP_404_NOT_FOUND)
        for ans in answers:
            qtext = ans.get('question')
            selected = ans.get('selected')
            try:
                q = TestQuestion.objects.get(test=test, question_text=qtext)
            except TestQuestion.DoesNotExist:
                continue
            TestAnswer.objects.create(
                user=request.user,
                test=test,
                question=q,
                selected_option=selected,
                is_correct=(selected == q.correct_option)
            )
        Activity.objects.create(user=request.user, activity_type='answer')
        return Response({"message": "Respuestas guardadas correctamente."})


class TestQuestionViewSet(viewsets.ModelViewSet):
    queryset = TestQuestion.objects.all()
    serializer_class = TestQuestionSerializer
    permission_classes = [IsAuthenticated]


class TestAnswerViewSet(viewsets.ModelViewSet):
    queryset = TestAnswer.objects.all()
    serializer_class = TestAnswerSerializer
    permission_classes = [IsAuthenticated]


class ActivityViewSet(viewsets.ModelViewSet):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticated]


class StudentTeacherViewSet(viewsets.ModelViewSet):
    queryset = StudentTeacher.objects.all()
    serializer_class = StudentTeacherSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # El teacher es siempre el usuario autenticado
        serializer.save(teacher=self.request.user)

    @action(detail=True, methods=['post'], url_path='respond')
    def respond(self, request, pk=None):
        """El alumno acepta/rechaza la invitación"""
        obj = self.get_object()
        if request.user != obj.student:
            return Response({'error':'No autorizado'}, status=403)

        decision = request.data.get('status')
        if decision not in ['accepted','rejected']:
            return Response({'error':'Status inválido'}, status=400)

        obj.status = decision
        obj.responded_at = timezone.now()
        obj.save()
        return Response({'status': obj.status})


class AskAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        question = request.data.get('question')
        subject = request.data.get('subject')
        action = request.data.get('action', 'answer')
        if not question or not subject:
            return Response({"error": "Faltan campos requeridos"}, status=status.HTTP_400_BAD_REQUEST)

        context = extraer_texto_de_documentos_usuario(subject, request.user.id)
        if not context.strip():
            return Response({"error": "No se pudo extraer texto de los documentos"}, status=status.HTTP_400_BAD_REQUEST)

        if action == 'test':
            prompt = (
                f"Eres AulaGPT, un generador de tests para la asignatura {subject}.\n"
                f"Usa únicamente el siguiente contenido:\n\n{context[:8000]}\n\n"
                "Genera 5 preguntas de opción múltiple en JSON puro, sin comentarios ni texto extra."
            )
        elif action == 'summary':
            prompt = (
                f"Eres AulaGPT, un generador de resúmenes para la asignatura {subject}.\n"
                f"Usa únicamente el siguiente contenido:\n\n{context[:8000]}\n\n"
                "Devuélveme un resumen en máximo 5 viñetas."
            )
        else:
            prompt = (
                f"Eres AulaGPT, un asistente educativo para la asignatura {subject}.\n"
                f"Tienes este contenido disponible:\n\n{context[:8000]}\n\n"
                "Usa ese contenido solo si es relevante para responder la pregunta. "
                "Si la pregunta no está relacionada con el material, responde de forma natural.\n\n"
                "Responde de forma clara y concisa."
            )

        openai.api_key = settings.OPENAI_API_KEY
        try:
            resp = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user",   "content": question}
                ]
            )
            raw = resp.choices[0].message.content.strip()
        except Exception as e:
            return Response({"error": f"Fallo en OpenAI: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if action == 'test':
            match = re.search(r'\[.*\]', raw, re.DOTALL)
            if not match:
                return Response({"error": "La respuesta de OpenAI no contiene un JSON válido."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            try:
                items = json.loads(match.group(0))
            except Exception as e:
                return Response({"error": f"Error parseando JSON: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            test = Tests.objects.create(
                creator=request.user,
                document=None,
                test_name=f"Test automático {subject} – {timezone.now():%Y-%m-%d %H:%M}"
            )
            for it in items:
                TestQuestion.objects.create(
                    test=test,
                    question_text=it.get('question'),
                    option_a=it.get('options', [None])[0],
                    option_b=it.get('options', [None])[1],
                    option_c=it.get('options', [None])[2],
                    option_d=it.get('options', [None])[3],
                    correct_option=it.get('correct')
                )

            ChatHistory.objects.create(
                user=request.user,
                subject=subject,
                question=question,
                response=raw
            )
            return Response({
                "question": question,
                "test_id": test.test_id,
                "test": items
            })

        ChatHistory.objects.create(
            user=request.user,
            subject=subject,
            question=question,
            response=raw
        )
        return Response({
            "question": question,
            "answer": raw
        })

class ProgressViewSet(viewsets.ModelViewSet):
    queryset = Progress.objects.all()
    serializer_class = ProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Cada alumno solo ve su propio progreso
        if self.request.user.role == 'student':
            return Progress.objects.filter(student=self.request.user)
        # Los profesores (o admins) pueden ver todos
        return super().get_queryset()
