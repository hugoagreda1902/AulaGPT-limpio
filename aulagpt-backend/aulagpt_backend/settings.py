import os
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve(strict=True).parent.parent

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    )
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# Seguridad
SECRET_KEY = 'fk5dd=8&!c(0on=y6hhhd6hftjq(i)krxv=c45f6tqj$t@uvet'  

# DEBUG activo para desarrollo. Cambia a False para producción.
DEBUG = True

# Hosts permitidos (en producción pon aquí los dominios autorizados)
ALLOWED_HOSTS = ['aulagpt.onrender.com', 'aulagpt.net', 'localhost', '127.0.0.1']


# Configuración base de datos MySQL, sin usar entorno ni env()
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'aulagpt',           # Cambia al nombre real de tu base de datos
        'USER': 'admin',                # Cambia por tu usuario MySQL
        'PASSWORD': 'RmHLRrJb19022004%',  # Cambia por tu contraseña MySQL
        'HOST': 'aulagpt-db.ctqi6iy86bw3.eu-north-1.rds.amazonaws.com',  # Host de tu DB en AWS
        'PORT': '3306',
    }
}

# URLs y directorios base
ROOT_URLCONF = 'aulagpt_backend.urls'

# Autenticación
AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
)
AUTH_USER_MODEL = 'api.User'  # Tu modelo personalizado de usuario

# Archivos estáticos y media
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Middleware
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Para servir estáticos en producción
    'corsheaders.middleware.CorsMiddleware',       # CORS debe ir antes de CommonMiddleware
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Apps instaladas
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'corsheaders',
    'rest_framework', 
    'rest_framework_simplejwt',  
    'api',  # Tu app principal
]

CORS_ALLOW_ALL_ORIGINS = True

# Auto campo por defecto
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Templates
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# Localización
TIME_ZONE = 'Europe/Madrid'
LANGUAGE_CODE = 'es-es'

USE_I18N = True
USE_L10N = True
USE_TZ = True

# Seguridad extra para producción
if not DEBUG:
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    X_FRAME_OPTIONS = 'DENY'

# Whitenoise - para servir estáticos en producción
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
