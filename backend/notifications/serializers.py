from rest_framework import serializers

from .models import (
    NotificationChannel,
    Trigger,
    NotificationTemplate,
    NotificationLog,
    DemoOrder,
)

class NotificationChannelSerializer(serializers.ModelSerializer):

    class Meta:
        model = NotificationChannel
        fields = [
            "id",
            "name",
            "channel_key",
            "description",
            "enabled",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "channel_key",
            "created_at",
            "updated_at",
        ]

    def validate_name(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Channel name cannot be empty."
            )

        return value

class TriggerSerializer(serializers.ModelSerializer):

    class Meta:
        model = Trigger
        fields = [
            "id",
            "name",
            "event_key",
            "description",
            "active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]

    def validate_name(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Trigger name cannot be empty."
            )

        return value

    def validate_event_key(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Event key cannot be empty."
            )

        return value


class NotificationTemplateSerializer(serializers.ModelSerializer):

    trigger_name = serializers.CharField(
        source="trigger.name",
        read_only=True,
    )

    class Meta:
        model = NotificationTemplate
        fields = [
            "id",
            "trigger",
            "trigger_name",
            "channel",
            "subject",
            "body",
            "enabled",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "trigger_name",
            "created_at",
            "updated_at",
        ]

    def validate_body(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Notification body cannot be empty."
            )

        return value

    def validate(self, attrs):

        channel = attrs.get(
            "channel",
            getattr(
                self.instance,
                "channel",
                None,
            ),
        )

        trigger = attrs.get(
            "trigger",
            getattr(
                self.instance,
                "trigger",
                None,
            ),
        )

        subject = attrs.get(
            "subject",
            getattr(
                self.instance,
                "subject",
                "",
            ),
        )

        # Email requires subject
        if channel == "email" and not subject.strip():
            raise serializers.ValidationError(
                {
                    "subject": (
                        "Email templates must have a subject."
                    )
                }
            )

        # Prevent duplicate trigger + channel
        if trigger and channel:

            existing_template = (
                NotificationTemplate.objects.filter(
                    trigger=trigger,
                    channel=channel,
                )
            )

            if self.instance:
                existing_template = (
                    existing_template.exclude(
                        pk=self.instance.pk
                    )
                )

            if existing_template.exists():

                raise serializers.ValidationError(
                    {
                        "non_field_errors": [
                            (
                                "A template already exists "
                                "for this trigger and channel. "
                                "Please edit the existing "
                                "template instead."
                            )
                        ]
                    }
                )

        return attrs


class NotificationLogSerializer(serializers.ModelSerializer):

    trigger_name = serializers.CharField(
        source="trigger.name",
        read_only=True,
    )

    class Meta:
        model = NotificationLog
        fields = [
            "id",
            "trigger",
            "trigger_name",
            "channel",
            "recipient",
            "subject",
            "message",
            "status",
            "provider_response",
            "error_message",
            "created_at",
            "sent_at",
        ]
        read_only_fields = [
            "id",
            "trigger_name",
            "status",
            "provider_response",
            "error_message",
            "created_at",
            "sent_at",
        ]

class DemoOrderSerializer(serializers.ModelSerializer):

    class Meta:
        model = DemoOrder

        fields = [
            "id",
            "customer_name",
            "email",
            "whatsapp",
            "web_push_subscription_id",
            "product_name",
            "amount",
            "payment_status",
            "created_at",
            "paid_at",
        ]

        read_only_fields = [
            "id",
            "payment_status",
            "created_at",
            "paid_at",
        ]

    def validate_customer_name(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Customer name is required."
            )

        return value

    def validate_product_name(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Product name is required."
            )

        return value

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Amount must be greater than zero."
            )

        return value        