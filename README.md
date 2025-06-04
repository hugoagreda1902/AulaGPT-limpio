# 📚 AulaGPT

AulaGPT es un asistente inteligente para alumnos y profesores, diseñado para mejorar la experiencia educativa mediante el uso de IA.

```plaintext
Aula-GPT/
├── aula-gpt-backend/                           # Backend: API, lógica de servidor y base de datos.
│   ├── api/                                    # Archivos de la API (modelos, vistas, serializadores).
│   │   ├── __init__.py                         # Inicialización del módulo.
│   │   ├── admin.py                            # Configuración del panel de administración.
│   │   ├── apps.py                             # Configuración de la app.
│   │   ├── models.py                           # Modelos de la base de datos.
│   │   ├── serializers.py                      # Serializadores para la API.
│   │   ├── urls.py                             # Pruebas unitarias.
│   │   └── views.py                            # Vistas de la API.
│   ├── __init__.py                             # Inicialización del proyecto backend.
│   ├── .env                                    # Variables de entorno del backend.
│   ├── asgi.py                                 # Configuración ASGI.
│   ├── manage.py                               # Herramienta de gestión de Django.
│   ├── requirements.txt                        # Dependencias del backend.
│   ├── settings.py                             # Configuración principal del proyecto.
│   ├── urls.py                                 # Rutas de la API.
│   └── wsgi.py                                 # Configuración WSGI.
├── aula-gpt-frontend/                          # Frontend: Interfaz de usuario y lógica en React.
│   ├── public/                                 # Archivos estáticos (HTML, imágenes).
│   │   ├── favicon.ico                         # Icono del sitio web.
│   │   ├── index.html                          # Documento HTML principal.
│   │   ├── logo192.png                         # Logo en formato 192x192.
│   │   ├── logo512.png                         # Logo en formato 512x512.
│   │   ├── manifest.json                       # Configuración para PWA.
│   │   └── robots.txt                          # Instrucciones para motores de búsqueda.
│   ├── src/                                    # Código fuente del frontend.
│   │   ├── API/                                # Lógica de interacción con la API.
│   │   │   └── dataService.js                  # Servicio para realizar peticiones HTTP.
│   │   ├── app.css                             # Estilos generales.
│   │   ├── app.js                              # Componente principal de la aplicación.
│   │   ├── app.test.js                         # Pruebas unitarias del frontend.
│   │   ├── config.js                           # Configuración global del frontend.
│   │   ├── index.css                           # Estilos globales.
│   │   ├── index.js                            # Punto de entrada de la aplicación.
│   │   ├── logo.svg                            # Logo en formato SVG.
│   │   ├── reportWebVitals.js                  # Métricas de rendimiento.
│   │   └── setupTests.js                       # Configuración de pruebas.
│   ├── .env                                    # Variables de entorno específicas del frontend.
│   ├── .gitignore                              # Archivos que Git debe ignorar.
│   ├── package.json                            # Dependencias y configuración del frontend.
│   ├── README.md                               # Documentación del frontend.
├── .env                                        # Variables de entorno globales.
├── .gitignore                                  # Archivos que Git debe ignorar.
├── README.md                                   # Documentación general del proyecto.
├── package.json                                # Información y dependencias globales.
├── package-lock.json                           # Bloqueo de versiones de dependencias.
└── requirements.txt                            # Dependencias globales del backend.
