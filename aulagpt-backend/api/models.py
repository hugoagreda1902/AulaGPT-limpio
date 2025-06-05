from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models

from django.contrib.auth import get_user_model

# Manager personalizado para el modelo User, para crear usuarios y superusuarsios
class UserManager(BaseUserManager):
    def create_user(self, email, name, surname, role, password=None):
        # Valida que el email sea obligatorio
        if not email:
            raise ValueError('Users must have an email address')
        # Normaliza el email (minúsculas)
        email = self.normalize_email(email)
        if role not in ['student', 'teacher']:
            raise ValueError('Role must be student or teacher')
        # Crea instancia del usuario con los datos básicos
        user = self.model(email=email, name=name, surname=surname, role=role)
        # Asigna la contraseña hasheada
        user.set_password(password)
        # Guarda el usuario en la base de datos
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, surname, role='teacher', password=None):
        if not email:
            raise ValueError('Users must have an email address')
        if role not in ['student', 'teacher']:
            raise ValueError('Role must be student or teacher')

        user = self.create_user(email, name, surname, role, password)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


# Modelo User personalizado, basado en AbstractBaseUser para manejar autenticación con email
class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('student', 'Student'),     # Rol alumno
        ('teacher', 'Teacher'),     # Rol profesor
    )
    user_id = models.AutoField(primary_key=True)                    # ID autoincremental único
    name = models.CharField(max_length=100)                         # Nombre del usuario
    surname = models.CharField(max_length=100)                      # Apellidos
    email = models.EmailField(unique=True)                          # Email único para login
    role = models.CharField(max_length=7, choices=ROLE_CHOICES)     # Rol del usuario

    is_active = models.BooleanField(default=True)                   # Indica si la cuenta está activa
    is_staff = models.BooleanField(default=False)                   # Permisos administrativos para Django admin

    # Campo que identifica al usuario para login (email en este caso)
    USERNAME_FIELD = 'email'
    # Campos obligatorios para crear un usuario
    REQUIRED_FIELDS = ['name', 'surname', 'role',]

    # Asigna el manager personalizado para crear usuarios
    objects = UserManager()

    def __str__(self):
        # Representación legible del usuario (nombre, apellido y rol)
        return f"{self.name} {self.surname} ({self.role})"

# Modelo intermedio para relación ManyToMany entre usuarios y clases   
class UserClass (models.Model):
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)        # FK a User
    class_id = models.ForeignKey('Class', on_delete=models.CASCADE)    # FK a Class

    class Meta:
        # Evita duplicados en la relación (un usuario no puede estar dos veces en la misma clase)
        unique_together = ('user_id', 'class_id')                     
    
    def __str__(self):
        return f"{self.user_id} in {self.class_id}"
    
# Modelo para clases o grupos de usuarios    
class Class(models.Model):
    class_id = models.AutoField(primary_key=True)                 
    class_name = models.CharField(max_length=100)                 
    acces_code = models.CharField(max_length=20, unique=True)     
    users = models.ManyToManyField(User, through='UserClass')    
    drive_folder_id = models.CharField(max_length=200, blank=True, null=True)  # ⬅️ nuevo campo

    def __str__(self):
        return self.class_name
    
# Modelo para documentos subidos, asociados a una clase    
class Documents(models.Model):
    document_id = models.AutoField(primary_key=True)

    # Asociar documento a usuario (opcional)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, null=True, related_name='documents')
    class_id = models.ForeignKey(Class, on_delete=models.CASCADE, default=1, related_name='documents')
    subject = models.CharField(max_length=100, default='Sin asignar')
    file_name = models.CharField(max_length=200)
    file_type = models.CharField(max_length=10)
    upload_date = models.DateTimeField(auto_now_add=True)
    drive_link = models.URLField()

    def __str__(self):
        return self.file_name

# Modelo para tests creados por alumnos, basados en documentos
class Tests (models.Model):
    test_id = models.AutoField (primary_key=True)                                                # No permitir duplacados en la relación
    user_id = models.ForeignKey (User, on_delete=models.CASCADE, related_name='tests_created')   # FK al alumno creador del test
    document_id = models.ForeignKey (Documents, on_delete=models.CASCADE, related_name='tests')  # FK al codumento usado para el test
    test_name = models.CharField (max_length=200)                                                # Nombre del test                                        
    creation_date = models.DateTimeField (auto_now_add=True)                                     # Fecha de creación automática

    def __str__(self):
        return self.test_name
    
# Modelo para preguntas dentro de un test
class TestQuestion (models.Model):
    question_id = models.AutoField (primary_key=True)                                              # ID de la pregunta
    test_id = models.ForeignKey (Tests, on_delete=models.CASCADE, related_name='questions')        # FK al test
    question_text = models.TextField ()                      # Texto de la pregunta 
    OPTION_CHOICES = (
    ('1', 'Option 1'),
    ('2', 'Option 2'),
    ('3', 'Option 3'),
    )
    correct_option = models.CharField(max_length=1, choices=OPTION_CHOICES)

    def __str__(self):
        # Muestra los primeros 50 caracteres
        return self.question_text[:50]                       

# Modelo para respuestas de los usuarios a las preguntas de tests
class TestAnswer (models.Model):
    answer_id = models.AutoField(primary_key=True)                                                 # ID de la respuesta
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='answers')               # FK al usuario que responde
    test = models.ForeignKey(Tests, on_delete=models.CASCADE, related_name='answers')              # FK al test contestado
    question = models.ForeignKey(TestQuestion, on_delete=models.CASCADE, related_name='answers')   # FK a la pregunta respondida
    selected_option = models.CharField(max_length=10)                                              # Opción elegida por el alumno
    is_correct = models.BooleanField()                                                             # Si la respuesta es correcta o no
    answer_date = models.DateTimeField(auto_now_add=True)                                          # Fecha y hora de la respuesta

    def __str__(self):
        return f"Answer by {self.user} on {self.answer_date}"

# Modelo para registrar actividad (subidas, tests, respuestas) de usuarios
class Activity(models.Model):
    activity_id = models.AutoField(primary_key=True)                                               # ID del registro de actividad
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')            # FK al usuario
    ACTIVITY_TYPES = (
        ('upload', 'Upload'),       # Subida de documento
        ('test', 'Test'),           # Creación de test
        ('answer', 'Answer'),       # Respuesta a pregunta
    )
    activity_type = models.CharField(max_length=10, choices=ACTIVITY_TYPES)                        # Tipo de actividad
    timestamp = models.DateTimeField(auto_now_add=True)                                            # Fecha y hora de la actividad

    def __str__(self):
        return f"{self.activity_type} by {self.user} at {self.timestamp}"