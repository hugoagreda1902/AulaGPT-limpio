from rest_framework import viewsets, status, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView

from django.db import connection
import time

from .models import User, Class, UserClass, Documents, Tests, TestQuestion, TestAnswer, Activity
from .serializers import (
    RegisterSerializer, UserSerializer, DocumentsSerializer, ClassSerializer, UserClassSerializer,
    TestsSerializer, TestQuestionSerializer, TestAnswerSerializer, ActivitySerializer
)

from api.google_drive.utils import subir_a_google_drive, crear_carpeta_drive
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer  # ya que está todo en serializers.py

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
            return Response({'error': 'Archivo, materia y clase son requeridos.'}, status=400)

        try:
            clase = Class.objects.get(pk=class_id)

            # Crear carpeta principal de la clase si no existe
            if not clase.drive_folder_id:
                folder_id = crear_carpeta_drive(clase.class_name)
                clase.drive_folder_id = folder_id
                clase.save()
            else:
                folder_id = clase.drive_folder_id

            # Obtener o crear subcarpeta para el usuario dentro de la carpeta de la clase
            user_folder_id = obtener_o_crear_subcarpeta_usuario(folder_id, request.user.user_id)

            # Subir archivo a la subcarpeta del usuario
            drive_link = subir_a_google_drive(file, user_folder_id)

        except Exception as e:
            return Response({'error': f'Error con Google Drive: {str(e)}'}, status=500)

        # Crear documento en base de datos
        document = Documents.objects.create(
            owner=request.user,
            class_id=clase,
            subject=subject,
            file_name=file.name,
            file_type=file.content_type,
            drive_link=drive_link
        )

        return Response(DocumentsSerializer(document).data, status=201)

# --- Clases ---
class ClassViewSet(viewsets.ModelViewSet):
    queryset = Class.objects.all()
    serializer_class = ClassSerializer
    permission_classes = [permissions.IsAuthenticated]


# --- Asociación usuario-clase ---
class UserClassViewSet(viewsets.ModelViewSet):
    queryset = UserClass.objects.all()
    serializer_class = UserClassSerializer
    permission_classes = [permissions.IsAuthenticated]


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
