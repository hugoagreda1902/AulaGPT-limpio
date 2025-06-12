from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from rest_framework import serializers
from .models import User, Documents, Tests, TestQuestion, TestAnswer, Activity, ChatHistory
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
        data['id'] = user.id
        data['name'] = user.name
        data['surname'] = user.surname
        data['role'] = user.role

        return data

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'name', 'surname', 'email', 'password', 'role')
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
        fields = ['id', 'name', 'surname', 'email', 'password', 'role']
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

