
import requests
from django.conf import settings


BREVO_URL = "https://api.brevo.com/v3/smtp/email"


def send_email(recipient, subject, message):
    """
    Send a real transactional email using Brevo API.
    """

    api_key = settings.BREVO_API_KEY
    sender_email = settings.BREVO_FROM_EMAIL
    sender_name = settings.BREVO_FROM_NAME

    if not api_key or not sender_email:
        return {
            "success": False,
            "provider": "brevo",
            "message": "Brevo API key or sender email is missing.",
        }

    payload = {
        "sender": {
            "name": sender_name,
            "email": sender_email,
        },
        "to": [
            {"email": recipient}
        ],
        "subject": subject or "Notification",
        "textContent": message,
    }

    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": api_key,
    }

    try:
        response = requests.post(
            BREVO_URL,
            headers=headers,
            json=payload,
            timeout=20,
        )

        try:
            data = response.json()
        except ValueError:
            data = {}

        if response.status_code == 201:
            return {
                "success": True,
                "provider": "brevo",
                "message": "Email accepted by Brevo.",
                "message_id": data.get("messageId"),
            }

        return {
            "success": False,
            "provider": "brevo",
            "message": data.get(
                "message",
                "Brevo rejected the email request.",
            ),
            "status_code": response.status_code,
        }

    except requests.RequestException as exc:
        return {
            "success": False,
            "provider": "brevo",
            "message": str(exc),
        }
