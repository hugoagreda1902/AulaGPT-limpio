import os
import io
import json
from django.conf import settings
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload

# ✅ Normalizar texto para que coincida con claves (sin tildes, minúsculas, sin espacios)
def normalizar(texto):
    texto = texto.lower().strip()
    texto = unicodedata.normalize('NFD', texto).encode('ascii', 'ignore').decode('utf-8')
    return texto

# ✅ Obtener servicio de Google Drive
def obtener_servicio_drive():
    info = json.loads(os.environ['GOOGLE_SERVICE_ACCOUNT_JSON'])
    credenciales = service_account.Credentials.from_service_account_info(
        info,
        scopes=['https://www.googleapis.com/auth/drive']
    )
    return build('drive', 'v3', credentials=credenciales)

# ✅ Obtener carpeta de Google Drive según asignatura
def obtener_carpeta_asignatura(asignatura):
    clave = normalizar(asignatura)
    carpeta_id = settings.GOOGLE_DRIVE_FOLDERS.get(clave)
    if not carpeta_id:
        raise ValueError(f"No se encontró carpeta de Drive para la asignatura: '{asignatura}'")
    return carpeta_id


def obtener_o_crear_subcarpeta_usuario(carpeta_padre_id, user_id):
    servicio = obtener_servicio_drive()

    query = f"'{carpeta_padre_id}' in parents and mimeType = 'application/vnd.google-apps.folder' and name = '{user_id}' and trashed = false"
    response = servicio.files().list(q=query, fields="files(id, name)").execute()
    carpetas = response.get('files', [])

    if carpetas:
        return carpetas[0]['id']

    metadatos = {
        'name': str(user_id),
        'mimeType': 'application/vnd.google-apps.folder',
        'parents': [carpeta_padre_id]
    }
    carpeta = servicio.files().create(body=metadatos, fields='id').execute()
    return carpeta.get('id')


# ✅ Subir archivo a Google Drive
def subir_archivo_drive(archivo, carpeta_id):
    servicio = obtener_servicio_drive()
    
    metadatos = {
        'name': archivo.name,
        'parents': [carpeta_id]
    }

    media = MediaIoBaseUpload(io.BytesIO(archivo.read()), mimetype=archivo.content_type, resumable=True)
    archivo_drive = servicio.files().create(body=metadatos, media_body=media, fields='id').execute()

    # Hacer el archivo público
    servicio.permissions().create(
        fileId=archivo_drive.get('id'),
        body={'type': 'anyone', 'role': 'reader'},
    ).execute()

    return f"https://drive.google.com/file/d/{archivo_drive.get('id')}/view?usp=sharing"
