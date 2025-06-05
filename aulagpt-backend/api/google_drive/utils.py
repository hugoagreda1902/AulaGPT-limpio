from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
import io
from django.conf import settings


# ✅ Conectar con el servicio de Google Drive
def get_drive_service():
    # Leer el JSON desde la variable de entorno
    info = json.loads(os.environ['GOOGLE_SERVICE_ACCOUNT_JSON'])

    credentials = service_account.Credentials.from_service_account_info(
        info,
        scopes=['https://www.googleapis.com/auth/drive']
    )

    return build('drive', 'v3', credentials=credentials)

# ✅ Crear carpeta de clase (si no existe)
def crear_carpeta_drive(nombre_carpeta):
    service = get_drive_service()
    folder_metadata = {
        'name': nombre_carpeta,
        'mimeType': 'application/vnd.google-apps.folder',
        'parents': [settings.GOOGLE_DRIVE_PARENT_FOLDER_ID]
    }
    carpeta = service.files().create(body=folder_metadata, fields='id').execute()
    return carpeta.get('id')


# ✅ Nueva función: obtener o crear subcarpeta por usuario
def obtener_o_crear_subcarpeta_usuario(parent_folder_id, user_id):
    service = get_drive_service()

    # Buscar si ya existe
    query = f"'{parent_folder_id}' in parents and mimeType = 'application/vnd.google-apps.folder' and name = '{user_id}' and trashed = false"
    response = service.files().list(q=query, fields="files(id, name)").execute()
    files = response.get('files', [])

    if files:
        return files[0]['id']  # Ya existe

    # Crear si no existe
    folder_metadata = {
        'name': str(user_id),
        'mimeType': 'application/vnd.google-apps.folder',
        'parents': [parent_folder_id]
    }
    carpeta = service.files().create(body=folder_metadata, fields='id').execute()
    return carpeta.get('id')


# ✅ Subir archivo a Google Drive
def subir_a_google_drive(file, folder_id):
    service = get_drive_service()
    file_metadata = {
        'name': file.name,
        'parents': [folder_id]
    }
    media = MediaIoBaseUpload(io.BytesIO(file.read()), mimetype=file.content_type, resumable=True)
    archivo = service.files().create(body=file_metadata, media_body=media, fields='id').execute()

    # Generar enlace de compartición
    service.permissions().create(
        fileId=archivo.get('id'),
        body={'type': 'anyone', 'role': 'reader'},
    ).execute()

    return f"https://drive.google.com/file/d/{archivo.get('id')}/view?usp=sharing"
