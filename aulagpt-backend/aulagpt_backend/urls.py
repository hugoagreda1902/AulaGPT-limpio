from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def home(request):
    return JsonResponse({"message": "API AulaGPT funcionando"})

urlpatterns = [
    path('', home),  # Ruta raíz /
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),  # Enlaza las urls de tu app 'api'
]
