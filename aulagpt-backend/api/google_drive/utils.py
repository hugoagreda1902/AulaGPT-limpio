import os
import io
from googleapiclient.discovery import build
from google.oauth2 import service_account
from googleapiclient.http import MediaIoBaseUpload

# Ruta al archivo de credenciales
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SERVICE_ACCOUNT_FILE = os.path.join(BASE_DIR, 'credentials.json')

# Scopes de acceso a Drive
SCOPES = ['https://www.googleapis.com/auth/drive']

# ID de la carpeta compartida general (puedes moverlo a settings si prefieres)
FOLDER_ID_GENERAL = '17VaTCurTKg2IZ1Oo-VC5W2uJNHTI6cy8'


def get_drive_service():
    """
    Autentica y retorna un servicio para interactuar con Google Drive.
    """
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    return build('drive', 'v3', credentials=creds)


def crear_carpeta_en_drive(folder_name, parent_folder_id=None):
    """
    Crea una carpeta en Google Drive.

    :param folder_name: Nombre de la carpeta a crear.
    :param parent_folder_id: ID de la carpeta padre (opcional).
    :return: ID de la nueva carpeta.
    """
    service = get_drive_service()
    file_metadata = {
        'name': folder_name,
        'mimeType': 'application/vnd.google-apps.folder',
    }
    if parent_folder_id:
        file_metadata['parents'] = [parent_folder_id]

    folder = service.files().create(body=file_metadata, fields='id').execute()
    return folder.get('id')


def subir_archivo_a_drive(file, file_name, mime_type, parent_folder_id):
    """
    Sube un archivo binario a una carpeta en Google Drive.

    :param file: Archivo (request.FILES['file']).
    :param file_name: Nombre del archivo en Drive.
    :param mime_type: Tipo MIME del archivo.
    :param parent_folder_id: ID de la carpeta en Drive.
    :return: URL de visualización en Google Drive.
    """
    service = get_drive_service()

    file_metadata = {
        'name': file_name,
        'parents': [parent_folder_id],
    }

    media = MediaIoBaseUpload(file, mimetype=mime_type)

    uploaded_file = service.files().create(
        body=file_metadata,
        media_body=media,
        fields='id'
    ).execute()

    file_id = uploaded_file.get('id')
    return f"https://drive.google.com/file/d/{file_id}/view"
