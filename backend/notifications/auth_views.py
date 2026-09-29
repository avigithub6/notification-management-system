
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status


@api_view(["POST"])
@permission_classes([AllowAny])
def admin_login(request):
    username = str(
        request.data.get("username", "")
    ).strip()

    password = request.data.get("password", "")

    if not username or not password:
        return Response(
            {
                "success": False,
                "message": "Username and password are required.",
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = authenticate(
        request,
        username=username,
        password=password,
    )

    if user is None or not user.is_active or not user.is_staff:
        return Response(
            {
                "success": False,
                "message": "Invalid admin credentials.",
            },
            status=status.HTTP_401_UNAUTHORIZED,
        )

    token, _ = Token.objects.get_or_create(user=user)

    return Response({
        "success": True,
        "token": token.key,
        "username": user.username,
        "message": "Admin login successful.",
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_profile(request):
    if not request.user.is_staff:
        return Response(
            {
                "success": False,
                "message": "Admin access required.",
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    return Response({
        "success": True,
        "username": request.user.username,
        "is_staff": request.user.is_staff,
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def admin_logout(request):
    if request.auth:
        request.auth.delete()

    return Response({
        "success": True,
        "message": "Logged out successfully.",
    })
