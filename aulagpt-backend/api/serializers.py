from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from rest_framework import serializers
from .models import User, Class, UserClass, Documents, Tests, TestQuestion, TestAnswer, Activity
import logging
from rest_framework import status
from rest_framework.response import Response

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'  # Le decimos a JWT que el identificador es 'email'

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        if email and password:
            user = authenticate(request=self.context.get("request"), email=email, password=password)
            if not user:
                raise serializers.ValidationError("Email o contraseña incorrectos")
        else:
            raise serializers.ValidationError("Debe incluir 'email' y 'password'")

        data = super().validate(attrs)

        # Información adicional opcional
        data['user_id'] = user.id
        data['name'] = user.name
        data['surname'] = user.surname
        data['role'] = user.role

        return data

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('user_id', 'name', 'surname', 'email', 'password', 'role')
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        user = User.objects.create_user(
            name=validated_data['name'],
            surname=validated_data['surname'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data['role']
        )
        return user

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=6)

    class Meta:
        model = User
        fields = ['user_id', 'name', 'surname', 'email', 'password', 'role']
        extra_kwargs = {
            'email': {'required': True},
            'name': {'required': True},
            'surname': {'required': True},
            'role': {'required': True},
        }

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este email ya está registrado.")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

logger = logging.getLogger(__name__)

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

            if not clase.drive_folder_id:
                folder_id = crear_carpeta_drive(clase.class_name)
                clase.drive_folder_id = folder_id
                clase.save()
            else:
                folder_id = clase.drive_folder_id

            user_folder_id = obtener_o_crear_subcarpeta_usuario(folder_id, request.user.user_id)

            drive_link = subir_a_google_drive(file, user_folder_id)

        except Exception as e:
            logger.error(f"Error en Google Drive: {str(e)}", exc_info=True)  # Log completo con traceback
            return Response({'error': f'Error con Google Drive: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            document = Documents.objects.create(
                owner=request.user,
                class_id=clase,
                subject=subject,
                file_name=file.name,
                file_type=file.content_type,
                drive_link=drive_link
            )
        except Exception as e:
            logger.error(f"Error al crear el documento en DB: {str(e)}", exc_info=True)
            return Response({'error': f'Error al crear documento: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        serializer = DocumentsSerializer(document)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = Class
        fields = '__all__'

    def create(self, validated_data):
        folder_name = validated_data.get('name')
        # Aquí debes llamar a la función que crea carpeta en Drive, no subir archivo
        from api.google_drive.utils import crear_carpeta_drive
        folder_id = crear_carpeta_drive(folder_name)
        validated_data['drive_folder_id'] = folder_id
        return super().create(validated_data)

class UserClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserClass
        fields = '__all__'

class TestsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tests
        fields = '__all__'

class TestQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestQuestion
        fields = '__all__'

class TestAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestAnswer
        fields = '__all__'

class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = '__all__'
