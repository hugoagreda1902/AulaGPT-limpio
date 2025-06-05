import os
import io
import json
from django.conf import settings
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload

# ✅ Conectarse con el servicio de Google Drive
def obtener_servicio_drive():
    info = json.loads(os.environ['GOOGLE_SERVICE_ACCOUNT_JSON'])

    credenciales = service_account.Credentials.from_service_account_info(
        info,
        scopes=['https://www.googleapis.com/auth/drive']
    )

    return build('drive', 'v3', credentials=credenciales)


# ✅ Obtener el ID de la carpeta según la asignatura
def obtener_carpeta_asignatura(asignatura):
    clave = asignatura.lower().strip()
    carpeta_id = settings.GOOGLE_DRIVE_FOLDERS.get(clave)
    if not carpeta_id:
        raise ValueError(f"No se encontró carpeta de Drive para la asignatura: '{asignatura}'")
    return carpeta_id


# ✅ Obtener o crear subcarpeta del usuario dentro de la carpeta de la asignatura
def obtener_o_crear_subcarpeta_usuario(carpeta_padre_id, usuario_id):
    servicio = obtener_servicio_drive()

    # Buscar si ya existe la subcarpeta con el ID del usuario
    consulta = (
        f"'{carpeta_padre_id}' in parents and "
        f"mimeType = 'application/vnd.google-apps.folder' and "
        f"name = '{usuario_id}' and trashed = false"
    )

    respuesta = servicio.files().list(q=consulta, fields="files(id, name)").execute()
    carpetas = respuesta.get('files', [])

    if carpetas:
        return carpetas[0]['id']  # Ya existe la carpeta

    # Crear la subcarpeta si no existe
    metadatos = {
        'name': str(usuario_id),
        'mimeType': 'application/vnd.google-apps.folder',
        'parents': [carpeta_padre_id]
    }
    nueva_carpeta = servicio.files().create(body=metadatos, fields='id').execute()
    return nueva_carpeta.get('id')


# ✅ Subir archivo a Google Drive
def subir_archivo_a_drive(archivo, carpeta_id):
    servicio = obtener_servicio_drive()

    metadatos = {
        'name': archivo.name,
        'parents': [carpeta_id]
    }

    media = MediaIoBaseUpload(io.BytesIO(archivo.read()), mimetype=archivo.content_type, resumable=True)

    archivo_creado = servicio.files().create(
        body=metadatos,
        media_body=media,
        fields='id'
    ).execute()

    # Hacer el archivo público (acceso de solo lectura)
    servicio.permissions().create(
        fileId=archivo_creado.get('id'),
        body={'type': 'anyone', 'role': 'reader'},
    ).execute()

    return f"https://drive.google.com/file/d/{archivo_creado.get('id')}/view?usp=sharing"
