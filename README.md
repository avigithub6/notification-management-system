# Notification System

Full-stack notification manager with a Django API and React/Vite frontend. Admins manage trigger/channel templates in one matrix. The sample site fires `login` and `logout`; WhatsApp Cloud API, Postmark, and browser Web Push are configured with environment variables.

## Run locally

### Backend

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
python manage.py migrate
python manage.py seed_demo
python manage.py runserver
```

Demo admin: `admin` / `Admin123!`. Change this immediately outside local development. API runs at `http://127.0.0.1:8000/api/`.

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Create a user account or sign in with the admin account to demonstrate the login/logout event flow.

## Channels and environment

Set values in `backend/.env` (never commit secrets):

- `WHATSAPP_ACCESS_TOKEN`, `PHONE_NUMBER_ID`, `WHATSAPP_BUSINESS_ACCOUNT_ID`, `WHATSAPP_API_VERSION` (optional, default `v21.0`)
- `POSTMARKAPP_TOKEN`, `POSTMARK_FROM_EMAIL`
- `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_CLAIMS_EMAIL` for standards-based Web Push
- `ONESIGNAL_APP_ID`, `ONESIGNAL_REST_API_KEY` only if integrating an external OneSignal subscription id
- `FRONTEND_URL` and `ALLOWED_HOSTS`

Email delivery uses Postmark's REST API. Web Push uses the browser's standard Push API and VAPID keys; browser subscriptions are stored per user. If a provider's credentials are missing, Test Send reports a clear configuration error; no fake delivery is reported as success. WhatsApp Cloud API requires an approved template for production initiated messages; this integration submits the configured template name and language, and template approval is managed in Meta.

## Admin

Sign in using the demo admin credentials and select **Notification settings**. Create triggers and per-channel templates, edit content, enable/disable channels, and send channel test messages. Variable placeholders use `{{ name }}` notation; login/logout templates can use `{{ name }}`, `{{ email }}`, and `{{ timestamp }}`. New triggers can be fired by website code through `POST /api/events/`.

## API overview

- `POST /api/auth/login/`, `POST /api/auth/logout/`, `GET /api/auth/me/`
- `GET/POST /api/triggers/`, `PATCH/DELETE /api/triggers/<id>/`
- `GET/POST /api/templates/`, `PATCH/DELETE /api/templates/<id>/`
- `POST /api/templates/<id>/test/`
- `POST /api/events/` (fires enabled, configured templates)
- `POST /api/push/subscribe/`

Admin endpoints require the Django session created by admin login. WhatsApp templates can be submitted to Meta review with **Save and sync with Meta**; sync again to check approval before test sending. Event and subscription endpoints are available to signed-in users.

## Deploy

Deploy `backend` as a Python web service on Render (`build.sh`, start command `gunicorn config.wsgi:application`), and `frontend` as a Vercel Vite project. Set `DATABASE_URL` to a persistent PostgreSQL instance for production, `SECRET_KEY`, `DEBUG=False`, `ALLOWED_HOSTS`, `FRONTEND_URL`, and provider keys in Render; set `VITE_API_URL` to the Render API origin in Vercel. Set `DEMO_ADMIN_PASSWORD` to a unique secret before the first production build to provision `admin`, or create the admin using Render's shell. Enable HTTPS for browser push. The default SQLite database is suitable only for local practice and ephemeral demos. No live URLs or walkthrough video are included because this workspace has no deployment credentials, provider keys, or recording access.

## Walkthrough checklist

1. Sign in as admin and create/edit a template in each channel cell.
2. Toggle a channel off and back on; use Test Send.
3. Sign in as a regular user, subscribe to browser push, then log in and log out.
4. Show the matching WhatsApp, email, and browser notifications after sandbox credentials are configured.
