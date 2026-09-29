
from django.core.exceptions import ValidationError

from ..serializers import NotificationLogSerializer
from .dispatcher import dispatch_notification


SUPPORTED_CHANNELS = ("email", "whatsapp", "web_push")


def fire_trigger(trigger, recipient=None, recipients=None):
    """
    Fire enabled templates using channel-specific recipients.

    Supports the old single-recipient argument for compatibility.
    Channels without a recipient are skipped.
    """

    if not trigger.active:
        raise ValidationError("Trigger is disabled.")

    templates = list(trigger.templates.filter(enabled=True))

    if not templates:
        raise ValidationError(
            "No enabled notification templates found."
        )

    if recipients is None:
        recipients = {
            channel: recipient
            for channel in SUPPORTED_CHANNELS
        }

    if not isinstance(recipients, dict):
        raise ValidationError(
            "Recipients must be an object."
        )

    cleaned_recipients = {}

    for channel in SUPPORTED_CHANNELS:
        value = recipients.get(channel, "")

        if value is None:
            value = ""

        if not isinstance(value, str):
            raise ValidationError(
                f"{channel} recipient must be text."
            )

        cleaned_recipients[channel] = value.strip()

    logs = []

    for template in templates:
        channel_recipient = cleaned_recipients.get(
            template.channel, ""
        )

        # No recipient supplied for this channel: skip it.
        if not channel_recipient:
            continue

        log = dispatch_notification(
            trigger=trigger,
            channel=template.channel,
            recipient=channel_recipient,
            subject=template.subject,
            message=template.body,
        )

        logs.append(
            NotificationLogSerializer(log).data
        )

    if not logs:
        raise ValidationError(
            "Enter a recipient for at least one enabled channel."
        )

    return logs
