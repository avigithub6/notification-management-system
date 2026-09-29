
import re

from django.core.exceptions import ValidationError

from ..serializers import NotificationLogSerializer
from .dispatcher import dispatch_notification


SUPPORTED_CHANNELS = ("email", "whatsapp", "web_push")

PLACEHOLDER_PATTERN = re.compile(r"\{\{\s*(\w+)\s*\}\}")


def render_template(text, context):
    """
    Replace placeholders such as {{customer_name}} and {{order_id}}
    with actual event data.
    """
    text = text or ""
    context = context or {}

    def replace(match):
        key = match.group(1)

        if key not in context:
            raise ValidationError(
                f"Missing template variable: {key}"
            )

        value = context[key]

        return "" if value is None else str(value)

    return PLACEHOLDER_PATTERN.sub(replace, text)


def fire_trigger(
    trigger,
    recipient=None,
    recipients=None,
    context=None,
):
    """
    Fire enabled templates using channel-specific recipients
    and dynamically rendered event data.
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

    if context is None:
        context = {}

    if not isinstance(context, dict):
        raise ValidationError(
            "Template context must be an object."
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

        if not channel_recipient:
            continue

        rendered_subject = render_template(
            template.subject,
            context,
        )

        rendered_message = render_template(
            template.body,
            context,
        )

        log = dispatch_notification(
            trigger=trigger,
            channel=template.channel,
            recipient=channel_recipient,
            subject=rendered_subject,
            message=rendered_message,
        )

        logs.append(
            NotificationLogSerializer(log).data
        )

    if not logs:
        raise ValidationError(
            "Enter a recipient for at least one enabled channel."
        )

    return logs
