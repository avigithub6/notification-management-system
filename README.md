# NotifyFlow — Notification Management System

A full-stack, event-driven notification management system built with **Django REST Framework** and **React (Vite)**. NotifyFlow provides a centralized admin dashboard for managing notification triggers, channel-specific templates, delivery settings, and notification activity. A public Demo Store generates website events that process enabled notifications through **WhatsApp, Email, and browser Web Push**.

This project was developed as a notification system assignment using sandbox and free-tier notification services.

## Live Application

| Resource | URL |
|---|---|
| Frontend (Vercel) | https://notification-management-system-beta.vercel.app/ |
| Admin Login | https://notification-management-system-beta.vercel.app/login |
| Public Demo Store | https://notification-management-system-beta.vercel.app/demo-website |
| Backend (Render) | https://notification-system-api-jx2l.onrender.com |
| GitHub Repository | https://github.com/avigithub6/notification-management-system |
| Walkthrough Video | https://drive.google.com/file/d/1BFGYnSmYeiO782JLxgbJmr7bjvTbNi9S/view?usp=sharing |

> The Demo Store is public. Administrative dashboard pages require an authenticated staff account. A local admin account does not automatically exist in the production database.

## Technology Stack

| Layer | Technology |
|---|---|
| Backend | Python, Django, Django REST Framework |
| Authentication | Django authentication, DRF token authentication |
| Frontend | React, Vite, React Router, Axios |
| Database | PostgreSQL (production), SQLite (local development) |
| WhatsApp | Meta WhatsApp Cloud API (sandbox) |
| Email | Brevo transactional email API |
| Web Push | OneSignal Web Push |
| Backend Hosting | Render |
| Frontend Hosting | Vercel |
| Version Control | Git and GitHub |

## Features

### Admin Authentication and Navigation

- Admin login using a Django staff account.
- Token-based authentication for admin profile and logout endpoints.
- Protected frontend dashboard routes, with profile validation before displaying admin pages.
- Logout attempts to revoke the backend token, clears the locally stored token, and returns the user to `/login`.
- Public `/demo-website` route remains accessible without an admin login.
- Sidebar navigation includes a Logout button.

**Authentication API endpoints:**

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/login/` | Authenticate a staff user and issue a token |
| GET | `/api/auth/profile/` | Validate the current admin session |
| POST | `/api/auth/logout/` | Revoke the current token |

> Frontend route protection is not a substitute for backend authorization. Review and protect every administrative API endpoint before using this project with untrusted users or production data. The Create New Account UI is not a completed public registration workflow.

### Centralized Notification Management

The **Notification Management** page uses a trigger-by-channel matrix:

| Trigger | WhatsApp | Email | Web Push |
|---|---|---|---|
| Order Created | Template | Template | Template |
| Payment Completed | Template | Template | Template |

Each cell represents a channel-specific template for the corresponding trigger. The dashboard supports:

- Creating, editing, enabling, and disabling notification templates.
- Enabling or disabling notification channels.
- Managing triggers from a centralized interface.
- Sending test notifications.
- Viewing notification activity and delivery results.
- Rendering dynamic variables in notification content.

### Implemented Website Triggers

**Order Created — `order.created`:** When a customer creates an order in the Demo Store, the backend records the order and fires the event. Enabled templates are processed for the configured channels.

**Payment Completed — `payment.completed`:** When payment is completed for a Demo Store order, the backend fires the event and processes its enabled templates.

These triggers are connected to Demo Store actions, not only manual test buttons.

### Notification Channels

- **WhatsApp — Meta Cloud API sandbox:** Uses a test phone number, access token, and authorized test recipient. Sandbox delivery is restricted to approved test recipients.
- **Email — Brevo:** Uses the transactional email API and a configured sender address.
- **Web Push — OneSignal:** Sends browser notifications to subscribed users who have granted notification permission. This is **browser Web Push**, not native Android or iOS push.

### Dynamic Templates

Templates support placeholders such as `{{customer_name}}` and `{{order_id}}`. Values are supplied by the relevant website event.

Example subject: `Order {{order_id}} Confirmed`

Example body: `Hello {{customer_name}}, your order {{order_id}} has been created successfully.`

## Project Structure

```text
notification-management-system/
├── backend/          # Django REST API, authentication, and notification integrations
├── frontend/         # React/Vite admin dashboard and public Demo Store
└── README.md
```

## Run Locally

### Prerequisites

- Python, Node.js, npm, and Git.
- Provider credentials for the notification channels you want to test.

### Backend Setup (Windows PowerShell)

```powershell
git clone https://github.com/avigithub6/notification-management-system.git
cd notification-management-system\backend

py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Configure the environment variables in `backend/.env`, then run:

```powershell
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Use the superuser credentials to sign in locally. Do not put real credentials in this README. Local backend: `http://127.0.0.1:8000/`; API base: `http://127.0.0.1:8000/api/`. SQLite can be used locally when no production `DATABASE_URL` is configured.

### Frontend Setup

Open a second terminal from the repository root:

```powershell
cd frontend
npm install
```

Create `frontend/.env` and set:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Then run:

```powershell
npm run dev
```

Open `http://localhost:5173/login` for the admin login or `http://localhost:5173/demo-website` for the public demo.

## Environment Configuration

Store backend credentials in `backend/.env` locally and in **Render → Environment** for deployment.

| Variable | Purpose |
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

**Frontend environment variable (Vercel):**

```env
VITE_API_BASE_URL=https://notification-system-api-jx2l.onrender.com
```

Never commit `.env` files, passwords, API keys, or access tokens.

## WhatsApp Sandbox Configuration

This assignment uses the **Meta WhatsApp Cloud API sandbox**, not a production WhatsApp Business messaging account.

1. Create a Meta for Developers app and add the WhatsApp product.
2. Open WhatsApp API Setup and generate a temporary access token.
3. Use Meta's test phone number and phone number ID.
4. Add the intended recipient to the authorized test recipient list.
5. Configure WhatsApp credentials in the backend environment.
6. Test delivery from Notification Management or the Demo Store.

**Token expiry:** Meta's temporary token expires. If requests fail because it expired, generate a new token and update `WHATSAPP_ACCESS_TOKEN` in Render. Only authorized test recipients can receive sandbox messages.

## How to Use

1. Open `/login` and sign in with an existing staff admin account.
2. Open **Notification Management** and configure the WhatsApp, Email, and Web Push templates for each trigger. Save and enable the desired templates and channels.
3. Use **Test Send** and inspect notification activity or error details.
4. Open the public [Demo Store](https://notification-management-system-beta.vercel.app/demo-website), create an order, and trigger `order.created`.
5. Complete payment for the demo order to trigger `payment.completed`.
6. Verify delivery on the authorized WhatsApp number, configured email inbox, and subscribed browser.
7. Use the sidebar **Logout** button to end the admin session.

A notification is processed only when its trigger/template is enabled and the provider configuration is valid. Provider acceptance and actual device/inbox delivery may differ.

## Deployment

### Backend — Render

Deploy the `backend` directory as a Python web service. Use the backend build script and the following Gunicorn start command:

```bash
gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --log-file - --access-logfile - --capture-output
```

Configure PostgreSQL and backend environment variables, and run Django migrations during deployment. Create a staff/superuser account **in the production database** using a secure administrative process; the local SQLite superuser is not transferred automatically.

### Frontend — Vercel

Deploy the `frontend` directory as a Vite application. Set `VITE_API_BASE_URL` to the deployed Render backend URL. The frontend includes an SPA rewrite so direct navigation to routes such as `/login` and `/demo-website` works.

## Assignment Demonstration Checklist

- [x] Django backend deployed on Render.
- [x] React frontend deployed on Vercel.
- [x] Centralized trigger/channel notification matrix.
- [x] Two website events: Order Created and Payment Completed.
- [x] Meta WhatsApp Cloud API sandbox integration.
- [x] Brevo transactional email integration.
- [x] OneSignal browser Web Push integration.
- [x] Live delivery tested across all three channels.
- [x] Admin login, profile validation, protected frontend routes, and logout implemented locally.
- [x] Public Demo Store route.
- [x] GitHub repository and live application URLs.
- [ ] Confirm deployed admin login and production admin account.
- [ ] Review backend authorization for all administrative endpoints.
- [ ] Record and add the voice-narrated end-to-end walkthrough video.

## Walkthrough Video

The walkthrough should demonstrate admin login, Notification Management, creating/editing a template, test send, toggling a channel, Demo Store order creation and payment, received WhatsApp/Email/Web Push notifications, and admin logout.

**Video URL:** Add the public/unlisted Loom, Google Drive, or YouTube link after recording.

## Security Notes

- Keep provider credentials in backend environment variables, never frontend code.
- Do not commit secrets, database passwords, or access tokens.
- Use a unique, strong password for the deployed admin account.
- Rotate any previously exposed credentials.
- The WhatsApp sandbox is for authorized test recipients only.
- A failed logout network request can clear the local token without confirming server-side revocation.
- Before production use, enforce staff authorization on every administrative backend endpoint; protecting React routes alone is insufficient.

## Author

**Avinash Gupta**  
GitHub: https://github.com/avigithub6
