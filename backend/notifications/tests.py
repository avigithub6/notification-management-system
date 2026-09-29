from django.test import TestCase
from rest_framework.test import APIClient

from .models import (
    NotificationChannel,
    NotificationLog,
    NotificationTemplate,
    Trigger,
)


class NotificationSystemTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.trigger = Trigger.objects.create(
            name="Order Created",
            event_key="order.created",
            description="Triggered when a new order is created",
            active=True,
        )

        NotificationTemplate.objects.create(
            trigger=self.trigger,
            channel="email",
            subject="Order Created",
            body="Your order has been created successfully.",
            enabled=True,
        )

        NotificationTemplate.objects.create(
            trigger=self.trigger,
            channel="whatsapp",
            subject="",
            body="Your order has been created successfully.",
            enabled=True,
        )

        NotificationTemplate.objects.create(
            trigger=self.trigger,
            channel="web_push",
            subject="Order Created",
            body="Your order has been created successfully.",
            enabled=True,
        )

    def test_trigger_list_api(self):
        response = self.client.get("/api/triggers/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_create_trigger(self):
        response = self.client.post(
            "/api/triggers/",
            {
                "name": "Payment Successful",
                "event_key": "payment.successful",
                "description": "Triggered after successful payment",
                "active": True,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(
            Trigger.objects.filter(
                event_key="payment.successful"
            ).count(),
            1,
        )

    def test_fire_trigger(self):
        response = self.client.post(
            f"/api/triggers/{self.trigger.id}/fire/",
            {
                "recipient": "test@example.com",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["success"])

        self.assertEqual(
            NotificationLog.objects.filter(
                trigger=self.trigger
            ).count(),
            3,
        )

        self.assertEqual(
            NotificationLog.objects.filter(
                trigger=self.trigger,
                status="sent",
            ).count(),
            3,
        )

    def test_disabled_trigger_cannot_fire(self):
        self.trigger.active = False
        self.trigger.save()

        response = self.client.post(
            f"/api/triggers/{self.trigger.id}/fire/",
            {
                "recipient": "test@example.com",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)

        self.assertFalse(
            response.data["success"]
        )

    def test_no_enabled_templates(self):
        NotificationTemplate.objects.filter(
            trigger=self.trigger
        ).update(enabled=False)

        response = self.client.post(
            f"/api/triggers/{self.trigger.id}/fire/",
            {
                "recipient": "test@example.com",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)

        self.assertFalse(
            response.data["success"]
        )

        self.assertEqual(
            NotificationLog.objects.filter(
                trigger=self.trigger
            ).count(),
            0,
        )

    def test_disabled_channel_is_not_sent(self):
        whatsapp_channel = NotificationChannel.objects.get(
            channel_key="whatsapp"
        )

        whatsapp_channel.enabled = False
        whatsapp_channel.save()

        response = self.client.post(
            f"/api/triggers/{self.trigger.id}/fire/",
            {
                "recipient": "test@example.com",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["success"])

        whatsapp_log = NotificationLog.objects.get(
            trigger=self.trigger,
            channel="whatsapp",
        )

        self.assertEqual(
            whatsapp_log.status,
            "failed",
        )

        self.assertEqual(
            whatsapp_log.error_message,
            "WhatsApp channel is disabled.",
        )

        sent_logs = NotificationLog.objects.filter(
            trigger=self.trigger,
            status="sent",
        )

        self.assertEqual(
            sent_logs.count(),
            2,
        )        