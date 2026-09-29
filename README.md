# Notification Management System

A full-stack, event-driven notification management system built with **Django REST Framework** and **React (Vite)**.

The application provides a centralized admin dashboard to manage notification triggers, channel-specific templates, and delivery settings. A connected Demo Store generates real website events that automatically send notifications through **WhatsApp, Email, and Web Push**.

This project was developed as a notification system assignment using sandbox and free-tier notification services.

## Live Application

| Resource | URL |
|---|---|
| Frontend (Vercel) | https://notification-management-system-beta.vercel.app/ |
| Backend (Render) | https://notification-system-api-jx2l.onrender.com |
| GitHub Repository | https://github.com/avigithub6/notification-management-system |
| Walkthrough Video | Add the public/unlisted video URL after recording |

**Demo Store:** https://notification-management-system-beta.vercel.app/demo-website

## Technology Stack

| Layer | Technology |
|---|---|
| Backend | Python, Django, Django REST Framework |
| Frontend | React, Vite |
| Database | PostgreSQL (production), SQLite (local development) |
| WhatsApp | Meta WhatsApp Cloud API (sandbox) |
| Email | Brevo transactional email API |
| Web Push | OneSignal Web Push |
| Backend Hosting | Render |
| Frontend Hosting | Vercel |
| Version Control | Git and GitHub |

## Features

### Centralized Notification Dashboard

The Notification Settings page uses a trigger-by-channel matrix:

| Trigger | WhatsApp | Email | Web Push |
|---|---|---|---|
| Order Created | Template | Template | Template |
| Payment Completed | Template | Template | Template |

Each cell represents a channel-specific notification template for its corresponding trigger.

The dashboard supports:

- Creating and editing notification templates.
- Enabling or disabling templates and notification channels.
- Sending test notifications.
- Managing triggers from a centralized interface.
- Viewing notification activity and delivery results.
- Using dynamic variables in notification content.

### Implemented Website Triggers

**1. Order Created — `order.created`**

When a customer creates an order through the Demo Store, the backend records the order and fires the Order Created event. Enabled notification templates are processed for WhatsApp, Email, and Web Push.

**2. Payment Completed — `payment.completed`**

When payment is completed for an order through the Demo Store, the backend fires the Payment Completed event and processes its enabled notification templates.

Both triggers are connected to actual Demo Store actions rather than being limited to manual test buttons.

### Notification Channels

**WhatsApp — Meta Cloud API Sandbox**

Uses Meta's test phone number, temporary access token, and authorized test recipient. WhatsApp messages are sent through the backend integration.

**Email — Brevo**

Uses Brevo's transactional email API and a configured sender address.

**Web Push — OneSignal**

Uses OneSignal for browser-based push notifications. Users must allow browser notifications and subscribe before receiving Web Push messages.

This project implements **browser Web Push**, not native Android or iOS push notifications.

### Dynamic Templates

Templates support dynamic placeholders, such as:

- `{{customer_name}}`
- `{{order_id}}`

Example email subject:

`Order {{order_id}} Confirmed`

Example body:

`Hello {{customer_name}}, your order {{order_id}} has been created successfully.`

Template values are supplied by the relevant website event.

## Project Structure

```text
notification-management-system/
├── backend/          # Django REST API and notification integrations
├── frontend/         # React/Vite dashboard and Demo Store
└── README.md
```

## Run Locally

### Prerequisites

- Python
- Node.js and npm
- Git
- Provider credentials for the notification channels you want to test

### Backend Setup (Windows PowerShell)

```powershell
git clone https://github.com/avigithub6/notification-management-system.git
cd notification-management-system\backend

py -m venv .venv
.\.venv\Scripts\Activate.ps1

pip install -r requirements.txt
Copy-Item .env.example .env
```

Configure the required environment variables in `backend/.env`, then run:

```powershell
python manage.py migrate
python manage.py runserver
```

Local backend:

`http://127.0.0.1:8000/`

Local API:

`http://127.0.0.1:8000/api/`

SQLite can be used for local development when no production `DATABASE_URL` is configured.

### Frontend Setup

Open a second terminal:

```powershell
cd notification-management-system\frontend
npm install
npm run dev
```

Local frontend:

`http://localhost:5173/`

Configure the frontend API base URL to point to the running Django backend.

## Environment Configuration

Store backend credentials in `backend/.env` locally and in **Render → Environment** for deployment.

The required configuration includes:

| Configuration | Purpose |
|---|---|
| `SECRET_KEY` | Django secret key |
| `DEBUG` | Django debug setting; use `False` in production |
| `DATABASE_URL` | PostgreSQL connection for production |
| `ALLOWED_HOSTS` | Allowed backend hosts |
| `CORS_ALLOWED_ORIGINS` | Allowed frontend origin |
| `CSRF_TRUSTED_ORIGINS` | Trusted frontend origin |
| `WHATSAPP_ACCESS_TOKEN` | Meta WhatsApp API access token |
| `PHONE_NUMBER_ID` | Meta WhatsApp test phone number ID |
| `BREVO_API_KEY` | Brevo transactional email API key |
| `ONESIGNAL_APP_ID` | OneSignal application ID |
| `ONESIGNAL_REST_API_KEY` | OneSignal REST API key |

Additional sender, recipient, WhatsApp, or OneSignal configuration may be required by the corresponding integration.

**Frontend environment variable:**

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

For the deployed frontend:

```env
VITE_API_BASE_URL=https://notification-system-api-jx2l.onrender.com
```

Never commit `.env` files, database passwords, API keys, or access tokens to GitHub.

## WhatsApp Sandbox Configuration

This assignment uses **Meta WhatsApp Cloud API sandbox**, not a production WhatsApp Business messaging account.

Setup:

1. Create a Meta for Developers app and add the WhatsApp product.
2. Open WhatsApp API Setup.
3. Generate a temporary access token.
4. Use Meta's test phone number and phone number ID.
5. Add the intended recipient to the authorized test recipient list.
6. Configure the WhatsApp credentials in the backend environment.
7. Test delivery from the Notification Settings page or Demo Store.

**Temporary token expiry:** The token generated from Meta's API Setup page expires. When WhatsApp requests fail because the token is expired, generate a new token and update the existing `WHATSAPP_ACCESS_TOKEN` environment variable in Render.

A permanent production token and verified company details are not required for this assignment's sandbox demonstration.

Only authorized test recipients can receive messages through the sandbox configuration.

## How to Use the Application

### 1. Open Notification Settings

Open the deployed frontend and access the admin dashboard using the configured admin account.

### 2. Configure Templates

For each trigger, configure the required WhatsApp, Email, and Web Push templates. Add dynamic placeholders where applicable, save the templates, and enable the corresponding channels.

### 3. Test a Channel

Use the template's Test Send functionality and inspect the notification activity or error details if delivery fails.

### 4. Test Order Created

Open the Demo Store:

https://notification-management-system-beta.vercel.app/demo-website

Create an order using the demo form. The website fires `order.created` and processes enabled notification templates.

### 5. Test Payment Completed

Complete payment for the demo order. The website fires `payment.completed` and processes enabled notification templates.

### 6. Verify Delivery

Confirm receipt through:

- WhatsApp on the authorized test number.
- Email in the configured recipient inbox.
- Browser notification on a subscribed browser.

A channel sends only when its trigger/template is enabled and its provider configuration is valid.

## Deployment

### Backend — Render

Deploy the `backend` directory as a Python web service.

Use the backend build script and a Gunicorn start command:

```bash
gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --log-file - --access-logfile - --capture-output
```

Configure PostgreSQL and all required backend environment variables in Render.

Run Django migrations during deployment.

### Frontend — Vercel

Deploy the `frontend` directory as a Vite application.

Set:

```env
VITE_API_BASE_URL=https://notification-system-api-jx2l.onrender.com
```

The frontend includes an SPA rewrite so direct navigation to routes such as `/demo-website` works.

## Assignment Demonstration Checklist

- [x] Django backend deployed on Render.
- [x] React frontend deployed on Vercel.
- [x] Centralized trigger/channel notification matrix.
- [x] Two website events: Order Created and Payment Completed.
- [x] WhatsApp Cloud API sandbox integration.
- [x] Brevo transactional email integration.
- [x] OneSignal browser Web Push integration.
- [x] Live delivery tested across all three channels.
- [x] GitHub repository and live application URLs.
- [ ] Record and add the voice-narrated end-to-end walkthrough video.

## Walkthrough Video

The walkthrough should demonstrate:

1. Opening the live frontend and accessing Notification Settings.
2. Creating or editing a channel template.
3. Testing a notification.
4. Turning a channel off and back on.
5. Creating an order in the Demo Store.
6. Completing payment for the order.
7. Showing the received WhatsApp, Email, and Web Push notifications for the implemented triggers.

**Video URL:** Add the public/unlisted Loom, Google Drive, or YouTube link here after recording.

## Security Notes

- Provider credentials are stored in backend environment variables.
- Secret keys and access tokens must never be exposed in frontend code or committed to the repository.
- Use a unique admin password for the deployed application.
- Rotate any credentials that have previously been exposed.
- The WhatsApp sandbox is intended for testing with authorized recipients only.

## Author

**Avinash Gupta**

GitHub: https://github.com/avigithub6
