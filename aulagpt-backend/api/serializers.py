# serializers.py
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from rest_framework import serializers
from .models import User, Documents, Tests, TestQuestion, TestAnswer, Activity, ChatHistory, StudentTeacher, Progress

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    # Usamos 'username' como identificador
    username_field = 'username'

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if not username or not password:
            raise serializers.ValidationError("Debe incluir 'username' y 'password'")

        user = authenticate(
            request=self.context.get('request'),
            username=username,
            password=password
        )
        if not user:
            raise serializers.ValidationError("Usuario o contraseña incorrectos")

        data = super().validate(attrs)
        # Añadimos datos extra al payload
        data.update({
            'id': user.id,
            'username': user.username,
            'invite_code': user.invite_code,
            'name': user.name,
            'surname': user.surname,
            'role': user.role,
        })
        return data

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id','username','invite_code', 'email','name','surname','password','role')
        read_only_fields = ('id', 'invite_code')  # marca invite_code como solo lectura
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Este username ya está en uso.")
        return value

    def create(self, validated_data):
        # validated_data no contendrá 'invite_code' (al ser read-only)
        return User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            name=validated_data['name'],
            surname=validated_data['surname'],
            role=validated_data['role'],
            password=validated_data['password']
        )

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'name', 'surname', 'role', 'invite_code')
        read_only_fields = ('id', 'invite_code')

class DocumentsSerializer(serializers.ModelSerializer):
    owner = serializers.IntegerField(source='owner.id', read_only=True)

    class Meta:
        model = Documents
        fields = [
            'document_id', 'owner', 'subject',
            'file_name', 'file_type', 'upload_date', 'drive_link'
        ]
        read_only_fields = ['document_id', 'upload_date', 'drive_link', 'file_name', 'file_type']

    def create(self, validated_data):
        raise NotImplementedError("La creación debe hacerse desde el ViewSet.")

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

class ChatHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatHistory
        fields = '__all__'
        read_only_fields = ['history_id', 'timestamp']

class StudentTeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentTeacher
        fields = ('id','student','teacher','date_assigned','status','responded_at')
        read_only_fields = ('date_assigned','responded_at','teacher')


class ProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Progress
        fields = ('id','student','subject','completed_tests','correct_answers','total_questions','summaries_generated','last_updated',)
        read_only_fields = ('id','last_updated',)