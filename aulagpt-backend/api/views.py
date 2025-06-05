from rest_framework import viewsets, status, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
from google.oauth2 import service_account
import io
from django.db import connection
import time
from .models import User, Class, UserClass, Documents, Tests, TestQuestion, TestAnswer, Activity
from .serializers import (
    RegisterSerializer, UserSerializer, DocumentsSerializer, ClassSerializer, UserClassSerializer,
    DocumentsSerializer, TestsSerializer, TestQuestionSerializer,
    TestAnswerSerializer, ActivitySerializer
)

@ api_view(['GET'])
@permission_classes([AllowAny])
def ping_db(request):
    start = time.time()
    try:
        connection.ensure_connection()
        status = "OK"
    except Exception as e:
        status = f"ERROR: {e}"
    elapsed = time.time() - start
    return Response({"db_status": status, "elapsed": elapsed})

# ✅ Vista protegida con autenticación JWT
class MiVistaProtegida(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"mensaje": f"Hola, {request.user.username}"})


# ✅ Gestión de usuarios
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
                "user_id": user.user_id,
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
                "user_id": user.user_id
            })
        else:
            return Response({"error": "Contraseña incorrecta"}, status=status.HTTP_401_UNAUTHORIZED)

# ✅ Gestión de documentos con subida a Google Drive
class DocumentsViewSet(viewsets.ModelViewSet):
    queryset = Documents.objects.all()
    serializer_class = DocumentsSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def create(self, request, *args, **kwargs):
        file = request.FILES.get('file')
        subject = request.data.get('subject')
        class_id = request.data.get('class_id')

        if not file or not subject or not class_id:
            return Response({'error': 'Archivo, materia y clase son requeridos.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            creds = service_account.Credentials.from_service_account_file(
                'api/google_drive/credentials.json',
                scopes=['https://www.googleapis.com/auth/drive']
            )

            service = build('drive', 'v3', credentials=creds)

            file_metadata = {
                'name': file.name,
                'parents': ['17VaTCurTKg2IZ1Oo-VC5W2uJNHTI6cy8'],  # ID carpeta compartida
            }

            media = MediaIoBaseUpload(file, mimetype=file.content_type)
            uploaded_file = service.files().create(body=file_metadata, media_body=media, fields='id').execute()

            drive_link = f"https://drive.google.com/file/d/{uploaded_file['id']}/view"

        except Exception as e:
            return Response({'error': f'Error al subir a Drive: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        document = Documents.objects.create(
            owner=request.user,
            class_id_id=class_id,
            subject=subject,
            file_name=file.name,
            file_type=file.content_type,
            drive_link=drive_link
        )

        return Response(DocumentsSerializer(document).data, status=status.HTTP_201_CREATED)

# ✅ Gestión de clases
class ClassViewSet(viewsets.ModelViewSet):
    queryset = Class.objects.all()
    serializer_class = ClassSerializer
    permission_classes = [permissions.IsAuthenticated]


# ✅ Asociación entre usuario y clase
class UserClassViewSet(viewsets.ModelViewSet):
    queryset = UserClass.objects.all()
    serializer_class = UserClassSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save()


# ✅ Tests, preguntas, respuestas y actividad
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
