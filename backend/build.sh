
#!/usr/bin/env bash

set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input

python manage.py migrate --no-input

# Temporary production admin setup
python manage.py shell -c '
import os
from django.contrib.auth import get_user_model

username = os.environ.get("ADMIN_USERNAME")
password = os.environ.get("ADMIN_PASSWORD")

if not username or not password:
    print("ADMIN_USERNAME or ADMIN_PASSWORD missing. Skipping admin setup.")
else:
    User = get_user_model()
    user, created = User.objects.get_or_create(username=username)

    user.set_password(password)
    user.is_staff = True
    user.is_superuser = True
    user.is_active = True
    user.save()

    print("Production admin account configured successfully.")
'
