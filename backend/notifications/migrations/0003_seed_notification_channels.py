from django.db import migrations


def create_default_channels(apps, schema_editor):
    NotificationChannel = apps.get_model(
        "notifications",
        "NotificationChannel",
    )

    default_channels = [
        {
            "name": "Email",
            "channel_key": "email",
            "description": "Email notification delivery channel.",
            "enabled": True,
        },
        {
            "name": "WhatsApp",
            "channel_key": "whatsapp",
            "description": "WhatsApp notification delivery channel.",
            "enabled": True,
        },
        {
            "name": "Web Push",
            "channel_key": "web_push",
            "description": "Browser web push notification delivery channel.",
            "enabled": True,
        },
    ]

    for channel in default_channels:
        NotificationChannel.objects.update_or_create(
            channel_key=channel["channel_key"],
            defaults={
                "name": channel["name"],
                "description": channel["description"],
                "enabled": channel["enabled"],
            },
        )


def remove_default_channels(apps, schema_editor):
    NotificationChannel = apps.get_model(
        "notifications",
        "NotificationChannel",
    )

    NotificationChannel.objects.filter(
        channel_key__in=[
            "email",
            "whatsapp",
            "web_push",
        ]
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("notifications", "0002_notificationchannel"),
    ]

    operations = [
        migrations.RunPython(
            create_default_channels,
            remove_default_channels,
        ),
    ]