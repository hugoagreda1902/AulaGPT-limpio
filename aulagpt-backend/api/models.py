import string
import random
from django.conf import settings
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

def generate_invite_code():
    """Genera un código único de 6 dígitos."""
    return ''.join(random.choices(string.digits, k=6))

# --- Manager personalizado ---
class UserManager(BaseUserManager):
    def _generate_unique_code(self):
        code = generate_invite_code()
        while User.objects.filter(invite_code=code).exists():
            code = generate_invite_code()
        return code

    def create_user(self, username, email, name, surname, role, password=None):
        if not username:
            raise ValueError('Users must have a username')
        if not email:
            raise ValueError('Users must have an email address')
        email = self.normalize_email(email)
        username = username.lower()
        if role not in ['student', 'teacher']:
            raise ValueError('Role must be student or teacher')
        invite_code = self._generate_unique_code()
        user = self.model(
            username=username,
            email=email,
            name=name,
            surname=surname,
            role=role,
            invite_code=invite_code
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, name, surname, role='teacher', password=None):
        user = self.create_user(username, email, name, surname, role, password)
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
    username = models.CharField(max_length=15, unique=True, null=True, blank=True)
    invite_code = models.CharField(max_length=6, null=True, editable=False, default=generate_invite_code, help_text="Código único de 6 dígitos para invitaciones")
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=100)
    surname = models.CharField(max_length=100)
    role = models.CharField(max_length=7, choices=ROLE_CHOICES)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email', 'name', 'surname', 'role']

    objects = UserManager()

    def __str__(self):
        return f"{self.username} ({self.role})"


# --- Student–Teacher assignment table ---
class StudentTeacher(models.Model):
    STATUS_CHOICES = (
        ('pending',  'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    )

    id = models.AutoField(primary_key=True)
    # Relación al alumno (solo roles='student')
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        limit_choices_to={'role': 'student'},
        on_delete=models.CASCADE,
        related_name='student_teachers'
    )
    # Relación al profesor (solo roles='teacher')
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        limit_choices_to={'role': 'teacher'},
        on_delete=models.CASCADE,
        related_name='teacher_students'
    )
    # Fecha en que el profesor crea la invitación
    date_assigned = models.DateTimeField(auto_now_add=True)
    # Estado de la invitación: pendiente, aceptada o rechazada
    status = models.CharField(
        max_length=8,
        choices=STATUS_CHOICES,
        default='pending',
        help_text='Estado de la asignación: pending, accepted o rejected'
    )
    # Fecha en que el alumno responde (acepta/rechaza)
    responded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        # Evita duplicados: un mismo par alumno–profesor solo puede existir una vez
        unique_together = ('student', 'teacher')

    def __str__(self):
        return f"{self.student.username} → {self.teacher.username} [{self.status}]"

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
        return f"Answer by {self.user.username} at {self.answer_date}"

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
        return f"{self.activity_type} by {self.user.username} at {self.timestamp}"

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
        return f"{self.user.username} → [{self.timestamp:%Y-%m-%d %H:%M}]"

# --- Progress Tracking por estudiante y asignatura ---
class Progress(models.Model):
    id = models.AutoField(primary_key=True)
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        limit_choices_to={'role': 'student'},
        on_delete=models.CASCADE,
        related_name='progress_records'
    )
    subject = models.CharField(
        max_length=100,
        help_text="Código o nombre de la asignatura"
    )
    completed_tests = models.IntegerField(
        default=0,
        help_text="Número de tests que el estudiante ha finalizado"
    )
    correct_answers = models.IntegerField(
        default=0,
        help_text="Total de respuestas correctas hasta ahora"
    )
    total_questions = models.IntegerField(
        default=0,
        help_text="Total de preguntas contestadas hasta ahora"
    )
    summaries_generated = models.IntegerField(
        default=0,
        help_text="Total de resúmenes generados por el estudiante en esta asignatura"
    )
    last_updated = models.DateTimeField(
        auto_now=True,
        help_text="Fecha de la última actualización de este registro"
    )

    class Meta:
        unique_together = ('student', 'subject')
        verbose_name = 'Progress'
        verbose_name_plural = 'Progress Records'

    def __str__(self):
        pct = (self.correct_answers / self.total_questions * 100) if self.total_questions else 0
        return f"{self.student.username} – {self.subject}: {pct:.1f}% complete, {self.summaries_generated} summaries"


