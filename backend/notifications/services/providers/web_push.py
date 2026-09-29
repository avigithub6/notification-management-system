
import requests
from django.conf import settings


ONESIGNAL_API_URL = "https://api.onesignal.com/notifications"


def send_web_push(recipient, message):
    """
    Send a real browser push notification through OneSignal.

    recipient: OneSignal Push Subscription ID
    message: Notification body
    """

    app_id = settings.ONESIGNAL_APP_ID
    api_key = settings.ONESIGNAL_REST_API_KEY

    if not app_id or not api_key:
        return {
            "success": False,
            "provider": "onesignal",
            "error": "OneSignal App ID or REST API key is missing.",
        }

    if not recipient or not str(recipient).strip():
        return {
            "success": False,
            "provider": "onesignal",
            "error": "OneSignal Push Subscription ID is required.",
        }

    if not message or not str(message).strip():
        return {
            "success": False,
            "provider": "onesignal",
            "error": "Notification message is required.",
        }

    headers = {
        "Authorization": f"Key {api_key}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    payload = {
        "app_id": app_id,
        "target_channel": "push",
        "include_subscription_ids": [str(recipient).strip()],
        "headings": {
            "en": "Notification Management System",
        },
        "contents": {
            "en": str(message),
        },
    }

    try:
        response = requests.post(
            ONESIGNAL_API_URL,
            headers=headers,
            json=payload,
            timeout=20,
        )

        try:
            data = response.json()
        except ValueError:
            data = {"raw_response": response.text[:500]}

        errors = data.get("errors") if isinstance(data, dict) else None
        notification_id = data.get("id") if isinstance(data, dict) else None
        recipients = data.get("recipients") if isinstance(data, dict) else None

        if response.ok and notification_id and not errors:
            return {
                "success": True,
                "provider": "onesignal",
                "message_id": notification_id,
                "recipients": recipients,
                "message": "Notification accepted by OneSignal.",
            }

        return {
            "success": False,
            "provider": "onesignal",
            "status_code": response.status_code,
            "error": errors or data,
        }

    except requests.RequestException as exc:
        return {
            "success": False,
            "provider": "onesignal",
            "error": str(exc),
        }
