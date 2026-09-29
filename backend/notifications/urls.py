from rest_framework.routers import DefaultRouter

from .views import (
    NotificationChannelViewSet,
    TriggerViewSet,
    NotificationTemplateViewSet,
    NotificationLogViewSet,
)

router = DefaultRouter()

router.register(
    "channels",
    NotificationChannelViewSet,
    basename="notification-channel"
)

router.register(
    "triggers",
    TriggerViewSet,
    basename="trigger"
)

router.register(
    "templates",
    NotificationTemplateViewSet,
    basename="notification-template"
)

router.register(
    "logs",
    NotificationLogViewSet,
    basename="notification-log"
)

urlpatterns = router.urls