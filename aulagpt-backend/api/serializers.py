from rest_framework import serializers
from .models import User, Class, UserClass, Documents, Tests, TestQuestion, TestAnswer, Activity

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

class DocumentsSerializer(serializers.ModelSerializer):
    file = serializers.FileField(write_only=True)

    class Meta:
        model = Documents
        fields = [
            'document_id', 'class_id', 'subject',
            'file', 'file_name', 'file_type', 'upload_date', 'drive_link'
        ]
        read_only_fields = ['document_id', 'upload_date', 'drive_link', 'file_name', 'file_type']

    def create(self, validated_data):
        raise NotImplementedError("La creación debe hacerse desde el ViewSet.")

class ClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = Class
        fields = '__all__'

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
