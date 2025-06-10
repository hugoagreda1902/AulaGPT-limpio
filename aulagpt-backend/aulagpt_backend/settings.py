import os
from pathlib import Path
from datetime import timedelta

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# OpenAI API Key
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')

# Google Drive Folders
GOOGLE_DRIVE_FOLDERS = {
    'matematicas': '1WP1J-sJgNpu5YE_tuNHXfnhZMSwZqQs0',
    'lengua': '1eh4Xl5eaM769N2J7LDfQotR9qH1zgiUv',
    'ingles': '1EmW54kRVywV0IU3vUhV0JLLPTF3RXMWo',
    'historia': '1RsZQZ41LJf39T4FBQQBU_ELsK7Emz1Oc',
    'ciencias': '1ZoXYWNPBnVA8sDKYB9-6KdfECf9h7QlJ',
    'fisica': '1gl0m8g8Mtv1Jynb5akpFcNRdqTqrU4gV',
    'quimica': '1zU4mf5df1plP_88WyZHjZ1XDjACq7NMm',
}

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

# Simple JWT settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# Security
SECRET_KEY = 'fk5dd=8&!c(0on=y6hhhd6hftjq(i)krxv=c45f6tqj$t@uvet'

# Debug mode (set to False in production)
DEBUG = True

# Allowed hosts (add your production domains here)
ALLOWED_HOSTS = ['aulagpt.onrender.com', 'aulagpt.net', 'localhost', '127.0.0.1']

# Database configuration (MySQL)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'aulagpt',           # Change to your actual database name
        'USER': 'admin',                # Change to your MySQL user
        'PASSWORD': 'RmHLRrJb19022004%',  # Change to your MySQL password
        'HOST': 'aulagpt-db.ctqi6iy86bw3.eu-north-1.rds.amazonaws.com',  # Your AWS DB host
        'PORT': '3306',
    }
}

# URLs and directories
ROOT_URLCONF = 'aulagpt_backend.urls'

# Authentication
AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
]
AUTH_USER_MODEL = 'api.User'  # Your custom user model

# Static files (CSS, JavaScript, images)
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')  # Use os.path.join for cross-platform compatibility

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')  # Use os.path.join for cross-platform compatibility

# Middleware
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Serve static files in production
    'corsheaders.middleware.CorsMiddleware',       # CORS middleware (must be before CommonMiddleware)
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Installed apps
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
    'api',  # Your main app
]

# CORS settings
CORS_ALLOW_ALL_ORIGINS = True

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Templates
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],  # Use os.path.join for cross-platform compatibility
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

# Localization
TIME_ZONE = 'Europe/Madrid'
LANGUAGE_CODE = 'es-es'

USE_I18N = True
USE_L10N = True
USE_TZ = True

# Security settings for production
if not DEBUG:
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    X_FRAME_OPTIONS = 'DENY'

# Whitenoise settings for serving static files in production
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
