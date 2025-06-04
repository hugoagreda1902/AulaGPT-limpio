from googleapiclient.discovery import build
from google.oauth2 import service_account
import os

# Cambia esto por la ruta real a tu archivo de credenciales (usa ruta absoluta si es posible)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SERVICE_ACCOUNT_FILE = os.path.join(BASE_DIR, 'credentials.json')

SCOPES = ['https://www.googleapis.com/auth/drive']

def get_drive_service():
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    service = build('drive', 'v3', credentials=creds)
    return service

def subir_a_google_drive(folder_name, parent_folder_id=None):
    """
    Crea una carpeta en Google Drive.
    
    :param folder_name: Nombre de la carpeta a crear.
    :param parent_folder_id: (Opcional) ID de la carpeta padre.
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
