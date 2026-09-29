from django.db import models

class NotificationChannel(models.Model):

    CHANNEL_CHOICES = [
        ("email", "Email"),
        ("whatsapp", "WhatsApp"),
        ("web_push", "Web Push"),
    ]

    name = models.CharField(
        max_length=100
    )

    channel_key = models.CharField(
        max_length=20,
        choices=CHANNEL_CHOICES,
        unique=True
    )

    description = models.TextField(
        blank=True
    )

    enabled = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name

class Trigger(models.Model):
    name = models.CharField(max_length=100, unique=True)
    event_key = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name


class NotificationTemplate(models.Model):

    CHANNEL_CHOICES = [
        ("email", "Email"),
        ("whatsapp", "WhatsApp"),
        ("web_push", "Web Push"),
    ]

    trigger = models.ForeignKey(
        Trigger,
        on_delete=models.CASCADE,
        related_name="templates"
    )

    channel = models.CharField(
        max_length=20,
        choices=CHANNEL_CHOICES
    )

    subject = models.CharField(
        max_length=255,
        blank=True
    )

    body = models.TextField()

    enabled = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["trigger", "channel"],
                name="unique_trigger_channel"
            )
        ]

    def __str__(self):
        return f"{self.trigger.name} - {self.channel}"


class NotificationLog(models.Model):

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("sent", "Sent"),
        ("failed", "Failed"),
    ]

    trigger = models.ForeignKey(
        Trigger,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="notification_logs"
    )

    channel = models.CharField(max_length=20)

    recipient = models.CharField(max_length=255)

    subject = models.CharField(
        max_length=255,
        blank=True
    )

    message = models.TextField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending"
    )

    provider_response = models.TextField(
        blank=True
    )

    error_message = models.TextField(
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    sent_at = models.DateTimeField(
        null=True,
        blank=True
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.channel} - {self.recipient} - {self.status}"

    
class DemoOrder(models.Model):

    PAYMENT_STATUS_CHOICES = [
        ("pending", "Pending"),
        ("completed", "Completed"),
    ]

    customer_name = models.CharField(max_length=100)
    email = models.EmailField()
    whatsapp = models.CharField(max_length=20, blank=True)
    web_push_subscription_id = models.CharField(
        max_length=255,
        blank=True,
    )

    product_name = models.CharField(max_length=150)
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default="pending",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Order #{self.pk} - {self.customer_name}"
