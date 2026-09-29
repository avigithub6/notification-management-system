from django.utils import timezone

from ..models import NotificationChannel, NotificationLog

from .providers.email import send_email
from .providers.whatsapp import send_whatsapp
from .providers.web_push import send_web_push


PROVIDERS = {
    "email": send_email,
    "whatsapp": send_whatsapp,
    "web_push": send_web_push,
}


def dispatch_notification(
    trigger,
    channel,
    recipient,
    subject,
    message,
):
    """
    Central notification dispatcher.

    Responsibilities:
    - Check whether the channel is globally enabled
    - Create notification log
    - Select the correct provider
    - Send notification
    - Update notification status
    - Store provider response/errors
    """

    channel_config = NotificationChannel.objects.filter(
        channel_key=channel
    ).first()

    if channel_config is None:
        raise ValueError(
            f"Notification channel is not configured: {channel}"
        )

    if not channel_config.enabled:
        log = NotificationLog.objects.create(
            trigger=trigger,
            channel=channel,
            recipient=recipient,
            subject=subject or "",
            message=message,
            status="failed",
            error_message=(
                f"{channel_config.name} channel is disabled."
            ),
        )

        return log

    log = NotificationLog.objects.create(
        trigger=trigger,
        channel=channel,
        recipient=recipient,
        subject=subject or "",
        message=message,
        status="pending",
    )

    try:
        provider = PROVIDERS.get(channel)

        if provider is None:
            raise ValueError(
                f"Unsupported notification channel: {channel}"
            )

        if channel == "email":
            result = provider(
                recipient=recipient,
                subject=subject,
                message=message,
            )
        else:
            result = provider(
                recipient=recipient,
                message=message,
            )

        if result.get("success"):
            log.status = "sent"
            log.provider_response = str(result)
            log.sent_at = timezone.now()
        else:
            log.status = "failed"
            log.provider_response = str(result)

        log.save()

        return log

    except Exception as exc:
        log.status = "failed"
        log.error_message = str(exc)
        log.save()

        return log