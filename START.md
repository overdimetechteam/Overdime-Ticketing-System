# Setup & Start Guide

## Prerequisites
- Node.js 18+
- PostgreSQL running locally (or any accessible PostgreSQL instance)

---

## 1. Configure the backend

Edit `backend/.env`:
- Set `DATABASE_URL` with your PostgreSQL credentials
- Set `JWT_SECRET` to any long random string
- Fill in `WORKHUB_TENANT_ID`, `WORKHUB_WORKFLOW_ID`, `WORKHUB_API_USERNAME`, `WORKHUB_API_PASSWORD`
- Optionally fill in SMTP settings for email notifications

---

## 2. Set up the database

```bash
cd backend
npx prisma migrate dev --name init
node src/config/seed.js
```

Default admin credentials created by seed:
- Email: `admin@company.com`
- Password: `Admin@1234`

**Change this password after first login!**

---

## 3. Start backend

```bash
cd backend
npm run dev
```

Backend runs on http://localhost:4000

---

## 4. Start frontend

```bash
cd frontend
npm run dev
```

Frontend runs on http://localhost:5173

---

## Workhub24 Webhook (for bidirectional sync)

Register this URL as a webhook in Workhub24:
```
POST http://your-domain.com/api/webhooks/workhub
```

The system also polls Workhub24 every 5 minutes as a fallback.

---

## Ticket ID format
Tickets are auto-numbered: TKT-00001, TKT-00002, etc.
