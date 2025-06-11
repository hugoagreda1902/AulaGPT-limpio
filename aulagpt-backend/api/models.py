# models.py (versión corregida y depurada)
from django.conf import settings
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

# --- Manager personalizado ---
class UserManager(BaseUserManager):
    def create_user(self, email, name, surname, role, password=None):
        if not email:
            raise ValueError('Users must have an email address')
        email = self.normalize_email(email)
        if role not in ['student', 'teacher']:
            raise ValueError('Role must be student or teacher')
        user = self.model(email=email, name=name, surname=surname, role=role)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, surname, role='teacher', password=None):
        user = self.create_user(email, name, surname, role, password)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user

# --- Usuario personalizado ---
class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('teacher', 'Teacher'),
    )
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    surname = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=7, choices=ROLE_CHOICES)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'surname', 'role']

    objects = UserManager()

    def __str__(self):
        return f"{self.name} {self.surname} ({self.role})"

# --- Documentos ---
class Documents(models.Model):
    document_id = models.AutoField(primary_key=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='documents',
        null=True
    )
    subject = models.CharField(max_length=100, default='Sin asignar')
    file_name = models.CharField(max_length=200)
    file_type = models.CharField(max_length=50)
    upload_date = models.DateTimeField(auto_now_add=True)
    drive_link = models.URLField()

    def __str__(self):
        return self.file_name

# --- Tests y preguntas ---
class Tests(models.Model):
    test_id = models.AutoField(primary_key=True)
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='tests_created'
    )
    document = models.ForeignKey(
        Documents,
        on_delete=models.CASCADE,
        related_name='tests'
    )
    test_name = models.CharField(max_length=200)
    creation_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.test_name

class TestQuestion(models.Model):
    question_id = models.AutoField(primary_key=True)
    test = models.ForeignKey(
        Tests,
        on_delete=models.CASCADE,
        related_name='questions'
    )
    question_text = models.TextField()
    option_a = models.CharField(max_length=255, null=True, blank=True)
    option_b = models.CharField(max_length=255, null=True, blank=True)
    option_c = models.CharField(max_length=255, null=True, blank=True)
    option_d = models.CharField(max_length=255, null=True, blank=True)

    CORRECT_OPTION_CHOICES = (
        ('A', 'Opción A'),
        ('B', 'Opción B'),
        ('C', 'Opción C'),
        ('D', 'Opción D'),
    )
    correct_option = models.CharField(max_length=1, choices=CORRECT_OPTION_CHOICES)

    def __str__(self):
        return self.question_text[:50]

class TestAnswer(models.Model):
    answer_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='answers'
    )
    test = models.ForeignKey(
        Tests,
        on_delete=models.CASCADE,
        related_name='answers'
    )
    question = models.ForeignKey(
        TestQuestion,
        on_delete=models.CASCADE,
        related_name='answers'
    )
    selected_option = models.CharField(max_length=1)
    is_correct = models.BooleanField()
    answer_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Answer by {self.user.email} at {self.answer_date}" 

# --- Actividades para estadísticas ---
class Activity(models.Model):
    activity_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='activities'
    )
    ACTIVITY_TYPES = (
        ('upload',  'Upload'),
        ('test',    'Test'),
        ('answer',  'Answer'),
        ('summary', 'Summary'),
    )
    activity_type = models.CharField(max_length=10, choices=ACTIVITY_TYPES)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.activity_type} by {self.user.email} at {self.timestamp}"  

# --- Historial de chat con IA ---
class ChatHistory(models.Model):
    history_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='chat_messages'
    )
    question = models.TextField()
    response = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    subject = models.CharField(max_length=100, default='Sin asignar')

    def __str__(self):
       return f"{self.user.email} → [{self.timestamp:%Y-%m-%d %H:%M}]" 