
import re

import requests
from django.conf import settings


def send_whatsapp(recipient, message):
    """
    Send a real WhatsApp text message through Meta Cloud API.

    Free-form text requires an open customer service window.
    Outside that window, an approved WhatsApp template is required.
    """

    token = settings.WHATSAPP_ACCESS_TOKEN
    phone_number_id = settings.PHONE_NUMBER_ID
    api_version = settings.WHATSAPP_API_VERSION

    if not token or not phone_number_id:
        return {
            "success": False,
            "provider": "meta-whatsapp",
            "message": "WhatsApp credentials are missing.",
        }

    # Meta expects international number without +, spaces or hyphens.
    phone = re.sub(r"\D", "", str(recipient))

    if not 8 <= len(phone) <= 15:
        return {
            "success": False,
            "provider": "meta-whatsapp",
            "message": "Invalid recipient phone number.",
        }

    if not message or not str(message).strip():
        return {
            "success": False,
            "provider": "meta-whatsapp",
            "message": "WhatsApp message cannot be empty.",
        }

    url = (
        f"https://graph.facebook.com/{api_version}/"
        f"{phone_number_id}/messages"
    )

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": phone,
        "type": "text",
        "text": {
            "preview_url": False,
            "body": str(message),
        },
    }

    try:
        response = requests.post(
            url,
            headers=headers,
            json=payload,
            timeout=20,
        )

        try:
            data = response.json()
        except ValueError:
            data = {}

        if response.status_code == 200:
            messages = data.get("messages", [])
            message_id = (
                messages[0].get("id")
                if messages
                else None
            )

            return {
                "success": True,
                "provider": "meta-whatsapp",
                "message": "WhatsApp message accepted by Meta.",
                "message_id": message_id,
            }

        error = data.get("error", {})

        return {
            "success": False,
            "provider": "meta-whatsapp",
            "message": error.get(
                "message",
                "Meta rejected the WhatsApp message.",
            ),
            "error_code": error.get("code"),
            "status_code": response.status_code,
        }

    except requests.Timeout:
        return {
            "success": False,
            "provider": "meta-whatsapp",
            "message": "Meta WhatsApp API request timed out.",
        }

    except requests.RequestException as exc:
        return {
            "success": False,
            "provider": "meta-whatsapp",
            "message": str(exc),
        }
