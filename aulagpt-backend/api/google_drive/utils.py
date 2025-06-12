import os
import io
import json
import unicodedata
from django.conf import settings
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload, MediaIoBaseDownload
import pdfplumber
import re

# Alcance de lectura/escritura para Drive
SCOPES = ['https://www.googleapis.com/auth/drive']

# --- Normalizar texto: minusculas, sin tildes ni espacios extra ---
def normalizar(texto):
    texto = texto.lower().strip()
    texto = unicodedata.normalize('NFD', texto).encode('ascii', 'ignore').decode('utf-8')
    return texto

# --- Crear cliente de Google Drive usando credenciales en variable de entorno ---
def obtener_servicio_drive():
    sa_info = json.loads(os.environ['GOOGLE_SERVICE_ACCOUNT_JSON'])
    creds = service_account.Credentials.from_service_account_info(sa_info, scopes=SCOPES)
    return build('drive', 'v3', credentials=creds)

# --- Obtener ID de carpeta de asignatura según clave en settings ---
def obtener_carpeta_asignatura(asignatura):
    clave = normalizar(asignatura)
    carpeta_id = settings.GOOGLE_DRIVE_FOLDERS.get(clave)
    if not carpeta_id:
        raise ValueError(f"No se encontró carpeta de Drive para la asignatura: '{asignatura}'")
    return carpeta_id

# --- Crear o recuperar subcarpeta de usuario dentro de la carpeta de asignatura ---
def obtener_o_crear_subcarpeta_usuario(carpeta_padre_id, user_id):
    servicio = obtener_servicio_drive()
    query = (
        f"'{carpeta_padre_id}' in parents and "
        "mimeType = 'application/vnd.google-apps.folder' and "
        f"name = '{user_id}' and trashed = false"
    )
    response = servicio.files().list(q=query, fields="files(id,name)").execute()
    carpetas = response.get('files', [])
    if carpetas:
        return carpetas[0]['id']
    # No existe: la creamos
    metadatos = {
        'name': str(user_id),
        'mimeType': 'application/vnd.google-apps.folder',
        'parents': [carpeta_padre_id]
    }
    carpeta = servicio.files().create(body=metadatos, fields='id').execute()
    return carpeta.get('id')

# --- Subir un archivo a Drive en la carpeta indicada ---
def subir_archivo_drive(archivo, carpeta_id):
    servicio = obtener_servicio_drive()
    metadatos = {
        'name': archivo.name,
        'parents': [carpeta_id]
    }
    media = MediaIoBaseUpload(
        io.BytesIO(archivo.read()),
        mimetype=archivo.content_type,
        resumable=True
    )
    created = servicio.files().create(body=metadatos, media_body=media, fields='id').execute()
    # Hacerlo público de solo lectura
    servicio.permissions().create(
        fileId=created.get('id'),
        body={'type': 'anyone', 'role': 'reader'},
    ).execute()
    return f"https://drive.google.com/file/d/{created.get('id')}/view?usp=sharing"

# --- Listar archivos en una carpeta de Drive ---
def list_files_in_folder(folder_id):
    servicio = obtener_servicio_drive()
    query = f"'{folder_id}' in parents and trashed = false"
    resp = servicio.files().list(q=query, fields='files(id,name)').execute()
    return resp.get('files', [])

# --- Descargar un PDF y extraer todo su texto ---
def download_pdf_text(file_id):
    servicio = obtener_servicio_drive()
    request = servicio.files().get_media(fileId=file_id)
    fh = io.BytesIO()
    downloader = MediaIoBaseDownload(fh, request)
    done = False
    while not done:
        _, done = downloader.next_chunk()
    fh.seek(0)
    pages = []
    with pdfplumber.open(fh) as pdf:
        for page in pdf.pages:
            pages.append(page.extract_text() or "")
    return "\n".join(pages)

# --- Extraer y concatenar texto de todos los PDFs de un usuario en una asignatura ---
def extraer_texto_de_documentos_usuario(subject, user_id):
    try:
        carpeta_asignatura = obtener_carpeta_asignatura(subject)
        carpeta_usuario = obtener_o_crear_subcarpeta_usuario(carpeta_asignatura, user_id)
        archivos = list_files_in_folder(carpeta_usuario)
        textos = []
        for archivo in archivos:
            if archivo['name'].lower().endswith('.pdf'):
                try:
                    textos.append(download_pdf_text(archivo['id']))
                except Exception as e:
                    print(f"No pude leer {archivo['name']}: {e}")
        return "\n\n".join(textos)
    except Exception as e:
        print(f"Error extrayendo texto de Drive: {e}")
        return ""

# --- Extraer el file_id desde un enlace compartido ---
def extraer_file_id_desde_link(link):
    match = re.search(r'/d/([a-zA-Z0-9_-]+)', link)
    if match:
        return match.group(1)
    match = re.search(r'id=([a-zA-Z0-9_-]+)', link)
    if match:
        return match.group(1)
    return None

# --- Eliminar archivo de Google Drive usando el enlace compartido ---
def eliminar_archivo_drive(link):
    file_id = extraer_file_id_desde_link(link)
    if not file_id:
        raise ValueError("No se pudo extraer el ID del archivo desde el enlace.")
    servicio = obtener_servicio_drive()
    try:
        servicio.files().delete(fileId=file_id).execute()
        return True
    except Exception as e:
        raise RuntimeError(f"Error al eliminar archivo de Google Drive: {e}")
