from rest_framework import serializers
from .models import User, Class, UserClass, Documents, Tests, TestQuestion, TestAnswer, Activity
from .google_drive.utils import subir_a_google_drive

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
        # Validar que no exista otro usuario con ese email
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este email ya está registrado.")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)  # Encriptar la contraseña
        user.save()
        return user
    

class DocumentsSerializer(serializers.ModelSerializer):
    file = serializers.FileField(write_only=True)

    class Meta:
        model = Documents
        fields = ['document_id', 'class_id', 'subject', 'file', 'file_name', 'file_type', 'upload_date', 'drive_link']
        read_only_fields = ['document_id', 'upload_date', 'drive_link', 'file_name', 'file_type']

    def create(self, validated_data):
        uploaded_file = validated_data.pop('file')  # ⚠️ importante

        # 👇 Aquí procesas el archivo, por ejemplo, lo subes a Google Drive:
        drive_link = subir_a_drive(uploaded_file)  # Esta función la defines tú
        file_name = uploaded_file.name
        file_type = uploaded_file.content_type

        # 👇 Guardas en la base de datos sólo lo que corresponde:
        document = Documents.objects.create(
            owner=self.context['request'].user,
            subject=validated_data.get('subject'),
            class_id=validated_data.get('class_id', None),
            file_name=file_name,
            file_type=file_type,
            drive_link=drive_link
        )
        return document

        
class ClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = Class
        fields = '__all__'

    def create(self, validated_data):
        folder_name = validated_data.get('name')
        # Crear carpeta en Google Drive
        folder_id = subir_a_google_drive (folder_name)
        # Asignar el ID de la carpeta a validated_data
        validated_data['google_drive_folder_id'] = folder_id
        # Crear la instancia Class con el folder_id
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
