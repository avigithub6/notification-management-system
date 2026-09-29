
from django.shortcuts import get_object_or_404

from django.utils import timezone
from django.db import transaction
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import (
    NotificationChannel,
    Trigger,
    NotificationTemplate,
    NotificationLog,
    DemoOrder,
)

from .serializers import (
    NotificationChannelSerializer,
    TriggerSerializer,
    NotificationTemplateSerializer,
    NotificationLogSerializer,
    DemoOrderSerializer,
)

from .services.dispatcher import dispatch_notification

from .services.trigger_service import (
    fire_trigger as fire_trigger_service,
)


# ============================================================
# 1. NOTIFICATION CHANNELS
# ============================================================

class NotificationChannelViewSet(viewsets.ModelViewSet):

    queryset = NotificationChannel.objects.all()

    serializer_class = NotificationChannelSerializer

    http_method_names = [
        "get",
        "patch",
        "head",
        "options",
    ]


# ============================================================
# 2. TRIGGERS
# ============================================================

class TriggerViewSet(viewsets.ModelViewSet):

    queryset = Trigger.objects.all()

    serializer_class = TriggerSerializer

    @action(
        detail=True,
        methods=["post"],
        url_path="fire",
    )
    def fire_trigger(self, request, pk=None):

        trigger = get_object_or_404(
            Trigger,
            pk=pk,
        )

        recipients = request.data.get("recipients")

        # Support the previous API payload as well.
        recipient = request.data.get("recipient")

        if recipients is not None and not isinstance(
            recipients, dict
        ):
            return Response(
                {
                    "success": False,
                    "message": "Recipients must be an object.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            logs = fire_trigger_service(
                trigger=trigger,
                recipient=recipient,
                recipients=recipients,
            )

        except Exception as exc:
            return Response(
                {
                    "success": False,
                    "message": str(exc),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "success": True,
                "trigger": trigger.name,
                "notifications": logs,
            }
        )

    
    @action(
        detail=False,
        methods=["post"],
        url_path="website-event",
    )
    def website_event(self, request):
        """
        Demo website event integration.

        Supported events:
        - order.created
        - payment.completed
        """

        event_key = str(
            request.data.get("event_key", "")
        ).strip()

        allowed_events = [
            "order.created",
            "payment.completed",
        ]

        if event_key not in allowed_events:
            return Response(
                {
                    "success": False,
                    "message": "Unsupported website event.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        recipients = request.data.get(
            "recipients",
            {},
        )

        if not isinstance(recipients, dict):
            return Response(
                {
                    "success": False,
                    "message": "Recipients must be an object.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        trigger = Trigger.objects.filter(
            event_key=event_key,
        ).first()

        if trigger is None:
            return Response(
                {
                    "success": False,
                    "message": (
                        f"No trigger configured for {event_key}."
                    ),
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            logs = fire_trigger_service(
                trigger=trigger,
                recipients=recipients,
            )

        except Exception as exc:
            return Response(
                {
                    "success": False,
                    "message": str(exc),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "success": True,
                "event_key": event_key,
                "trigger": trigger.name,
                "notifications": logs,
            },
            status=status.HTTP_200_OK,
        )

    @action(
        detail=False,
        methods=["post"],
        url_path="create-demo-order",
    )
    def create_demo_order(self, request):

        serializer = DemoOrderSerializer(
            data=request.data,
        )

        serializer.is_valid(raise_exception=True)

        # First save the actual demo order in the database.
        order = serializer.save()

        recipients = {
            "email": order.email,
            "whatsapp": order.whatsapp,
            "web_push": order.web_push_subscription_id,
        }

        notifications = []
        notification_error = None

        trigger = Trigger.objects.filter(
            event_key="order.created",
        ).first()

        if trigger is None:
            notification_error = (
                "Order saved, but order.created trigger "
                "is not configured."
            )
        else:
            try:
                notifications = fire_trigger_service(
                    trigger=trigger,
                    recipients=recipients,
                )

            except Exception as exc:
                notification_error = str(exc)

        return Response(
            {
                "success": True,
                "message": "Demo order created successfully.",
                "order": DemoOrderSerializer(order).data,
                "notifications": notifications,
                "notification_error": notification_error,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(
        detail=False,
        methods=["post"],
        url_path="complete-demo-payment",
    )
    def complete_demo_payment(self, request):

        order_id = request.data.get("order_id")

        if not order_id:
            return Response(
                {
                    "success": False,
                    "message": "Order ID is required.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Update the saved order only once.
        with transaction.atomic():

            order = get_object_or_404(
                DemoOrder.objects.select_for_update(),
                pk=order_id,
            )

            if order.payment_status == "completed":
                return Response(
                    {
                        "success": False,
                        "message": (
                            "Demo payment is already completed "
                            "for this order."
                        ),
                        "order": DemoOrderSerializer(order).data,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            order.payment_status = "completed"
            order.paid_at = timezone.now()

            order.save(
                update_fields=[
                    "payment_status",
                    "paid_at",
                ]
            )

        # Dispatch only after the database update succeeds.
        recipients = {
            "email": order.email,
            "whatsapp": order.whatsapp,
            "web_push": order.web_push_subscription_id,
        }

        notifications = []
        notification_error = None

        trigger = Trigger.objects.filter(
            event_key="payment.completed",
        ).first()

        if trigger is None:
            notification_error = (
                "Demo payment completed, but payment.completed "
                "trigger is not configured."
            )
        else:
            try:
                notifications = fire_trigger_service(
                    trigger=trigger,
                    recipients=recipients,
                )

            except Exception as exc:
                notification_error = str(exc)

        return Response(
            {
                "success": True,
                "message": "Demo payment completed successfully.",
                "order": DemoOrderSerializer(order).data,
                "notifications": notifications,
                "notification_error": notification_error,
            },
            status=status.HTTP_200_OK,
        )

# ============================================================
# 3. NOTIFICATION TEMPLATES
# ============================================================

class NotificationTemplateViewSet(viewsets.ModelViewSet):

    queryset = NotificationTemplate.objects.select_related(
        "trigger"
    ).all()

    serializer_class = NotificationTemplateSerializer

    # --------------------------------------------------------
    # Test Send - Sends only the selected template/channel
    # --------------------------------------------------------

    @action(
        detail=True,
        methods=["post"],
        url_path="test-send",
    )
    def test_send(self, request, pk=None):

        template = self.get_object()

        recipient = str(
            request.data.get("recipient", "")
        ).strip()

        # Validate recipient
        if not recipient:

            return Response(
                {
                    "success": False,
                    "message": "Recipient is required.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check whether trigger is active
        if not template.trigger.active:

            return Response(
                {
                    "success": False,
                    "message": "Trigger is disabled.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check whether template is enabled
        if not template.enabled:

            return Response(
                {
                    "success": False,
                    "message": "Template is disabled.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Dispatch notification
        try:

            log = dispatch_notification(
                trigger=template.trigger,
                channel=template.channel,
                recipient=recipient,
                subject=template.subject,
                message=template.body,
            )

        except Exception as exc:

            return Response(
                {
                    "success": False,
                    "message": str(exc),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Return delivery result
        return Response(
            {
                "success": log.status == "sent",

                "message": (
                    "Notification sent."
                    if log.status == "sent"
                    else log.error_message
                    or "Notification delivery failed."
                ),

                "notification": NotificationLogSerializer(
                    log
                ).data,
            }
        )


# ============================================================
# 4. NOTIFICATION LOGS
# ============================================================

class NotificationLogViewSet(
    viewsets.ReadOnlyModelViewSet
):

    queryset = NotificationLog.objects.select_related(
        "trigger"
    ).all()

    serializer_class = NotificationLogSerializer

