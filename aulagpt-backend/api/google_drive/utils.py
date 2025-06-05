from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
from google.oauth2 import service_account
import io
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SERVICE_ACCOUNT_FILE = os.path.join(BASE_DIR, 'credentials.json')
SCOPES = ['https://www.googleapis.com/auth/drive']

def get_drive_service():
    creds = service_account.Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    service = build('drive', 'v3', credentials=creds)
    return service

def crear_carpeta_drive(nombre_carpeta):
    service = get_drive_service()
    file_metadata = {
        'name': nombre_carpeta,
        'mimeType': 'application/vnd.google-apps.folder'
    }
    folder = service.files().create(body=file_metadata, fields='id').execute()
    return folder.get('id')

def subir_a_google_drive(file, folder_id=None):
    service = get_drive_service()

    file_metadata = {
        'name': file.name,
        'parents': [folder_id] if folder_id else []
    }

    # Convertir file a un stream que MediaIoBaseUpload acepta
    file_stream = io.BytesIO(file.read())
    media = MediaIoBaseUpload(file_stream, mimetype=file.content_type)
    uploaded_file = service.files().create(body=file_metadata, media_body=media, fields='id').execute()

    return f"https://drive.google.com/file/d/{uploaded_file['id']}/view"
