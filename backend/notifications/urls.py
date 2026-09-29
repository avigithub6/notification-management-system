
from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    NotificationChannelViewSet,
    TriggerViewSet,
    NotificationTemplateViewSet,
    NotificationLogViewSet,
)

from .auth_views import (
    admin_login,
    admin_profile,
    admin_logout,
)


router = DefaultRouter()

router.register(
    "channels",
    NotificationChannelViewSet,
    basename="notification-channel",
)

router.register(
    "triggers",
    TriggerViewSet,
    basename="trigger",
)

router.register(
    "templates",
    NotificationTemplateViewSet,
    basename="notification-template",
)

router.register(
    "logs",
    NotificationLogViewSet,
    basename="notification-log",
)


urlpatterns = [
    path("auth/login/", admin_login, name="admin-login"),
    path("auth/profile/", admin_profile, name="admin-profile"),
    path("auth/logout/", admin_logout, name="admin-logout"),
]

urlpatterns += router.urls
