from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def home(request):
    return JsonResponse({
        "success": True,
        "message": "Notification System API is running",
        "version": "1.0.0",
        "endpoints": {
            "triggers": "/api/triggers/",
            "templates": "/api/templates/",
            "logs": "/api/logs/",
            "admin": "/admin/"
        }
    })


urlpatterns = [
    path("", home),

    path(
        "admin/",
        admin.site.urls
    ),

    path(
        "api/",
        include("notifications.urls")
    ),
]