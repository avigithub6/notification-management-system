from django.contrib import admin

from .models import (
    NotificationChannel,
    Trigger,
    NotificationTemplate,
    NotificationLog,
)

@admin.register(NotificationChannel)
class NotificationChannelAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
        "channel_key",
        "enabled",
        "updated_at",
    )

    list_filter = (
        "enabled",
        "channel_key",
    )

    search_fields = (
        "name",
        "channel_key",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

@admin.register(Trigger)
class TriggerAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
        "event_key",
        "active",
        "created_at",
    )

    list_filter = (
        "active",
    )

    search_fields = (
        "name",
        "event_key",
    )


@admin.register(NotificationTemplate)
class NotificationTemplateAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "trigger",
        "channel",
        "enabled",
        "created_at",
    )

    list_filter = (
        "channel",
        "enabled",
    )

    search_fields = (
        "trigger__name",
        "body",
    )


@admin.register(NotificationLog)
class NotificationLogAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "trigger",
        "channel",
        "recipient",
        "status",
        "created_at",
    )

    list_filter = (
        "channel",
        "status",
    )

    search_fields = (
        "recipient",
        "message",
    )