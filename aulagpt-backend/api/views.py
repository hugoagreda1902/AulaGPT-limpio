from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import traceback

from .models import Documents, ChatHistory, Activity
from openai import OpenAI
from django.conf import settings


class AskAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        question = request.data.get('question')
        subject_id = request.data.get('subject')
        action = request.data.get('action', 'answer')

        if not question or not subject_id:
            return Response(
                {"error": "Faltan campos requeridos (question o subject)"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            document = Documents.objects.filter(subject=subject_id).first()
            if not document:
                return Response(
                    {"error": "Asignatura no encontrada"},
                    status=status.HTTP_404_NOT_FOUND
                )
            subject_name = document.subject  # Ajusta si tu modelo tiene otro campo para nombre
        except Exception:
            return Response(
                {"error": "Error buscando la asignatura"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        system_prompt = (
            f"Eres **AulaGPT**, un asistente educativo para la asignatura "
            f"{subject_name}. Tu conocimiento se basa únicamente en los "
            "documentos que el usuario ha subido.\n\n"
            "Reglas de respuesta:\n"
            "1. **Explicaciones**: claras y concisas, pasos numerados si hay varios.\n"
            "2. **Resúmenes**: máximo 5 viñetas.\n"
            "3. **Tests** (si action=='answer' y se piden tests): genera preguntas "
            "de opción múltiple A–D y devuelve un JSON con campos "
            "[{\"question\":…, \"options\":[…], \"correct\":\"B\"},…].\n"
            "4. **Tono**: amigable y profesional.\n"
            "5. **Límites**: no inventes nada fuera de los documentos subidos.\n"
        )

        try:
            client = OpenAI(api_key=settings.OPENAI_API_KEY)

            completion = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": question}
                ]
            )
            answer_text = completion.choices[0].message.content.strip()

            # Guardar el historial de chat
            ChatHistory.objects.create(
                user=request.user,
                subject=document.subject,
                question=question,
                response=answer_text
            )

            # Registrar actividad
            Activity.objects.create(
                user=request.user,
                subject=document.subject,
                activity_type='summary' if action == 'summary' else 'answer'
            )

            return Response({
                "question": question,
                "answer": answer_text
            }, status=status.HTTP_200_OK)

        except Exception as e:
            traceback.print_exc()
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )