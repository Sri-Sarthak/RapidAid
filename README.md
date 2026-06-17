# RapidAid — Accident SOS & Emergency Response Platform (MERN)

A full-stack MERN application for accident emergency response: a one-tap SOS button that
alerts family members with live location, shows nearby hospitals with real-time bed
availability, and notifies nearby volunteers — with automatic radius expansion if no one
responds. Bystanders can also report accidents on behalf of a victim. Hospitals get their
own portal to keep bed/facility data live.

## Tech stack

- **Frontend:** React (Vite), Tailwind CSS, React Router, Leaflet/OpenStreetMap, Socket.IO client, Axios
- **Backend:** Node.js, Express, MongoDB (Mongoose), Socket.IO, JWT auth, Nodemailer, node-cron
- **Maps:** Leaflet + OpenStreetMap (no API key required)
- **Realtime/notifications:** Socket.IO (in-app) + Email (Nodemailer, family SOS alerts)

## Folder structure

```
mern-accident-sos/
├── backend/
│   ├── config/          # DB connection + shared constants (radius, facilities list)
│   ├── controllers/      # Route handler logic (auth, hospital, sos, alert, volunteer)
│   ├── jobs/             # node-cron job: radius escalation for unanswered alerts
│   ├── middleware/       # JWT auth guards + centralized error handling
│   ├── models/           # Mongoose schemas: User, Hospital, EmergencyAlert, Notification
│   ├── routes/           # Express routers, one per resource
│   ├── services/         # Shared business logic (volunteer matching, notifications)
│   ├── sockets/          # Socket.IO connection + per-user event emitter
│   ├── utils/            # geo math, JWT helper, email service, hospital seed script
│   ├── .env.example
│   ├── package.json
│   └── server.js         # App entrypoint
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── api/           # axios instance (auto-attaches JWT)
    │   ├── components/    # Navbar, SOSButton, MapView, AlertCard, HospitalCard, etc.
    │   ├── context/        # AuthContext (user/hospital session), SocketContext (realtime)
    │   ├── pages/          # Home, Login/Register (user + hospital), Dashboards, Alert status
    │   ├── utils/           # formatting + geolocation helpers
    │   ├── config.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env.example
    ├── tailwind.config.js
    └── package.json
```

## How the core flow works

1. **SOS trigger** (`POST /api/sos/trigger`): captures the user's live GPS location, creates
   an `EmergencyAlert`, emails every family contact with an email on file (message + a
   clickable Google Maps live-location link), looks up nearby hospitals (with bed
   availability & facilities), and notifies nearby *available* volunteers in real time via
   Socket.IO + an in-app `Notification` record.
2. **Bystander report** (`POST /api/alerts/bystander`): same volunteer/hospital notification
   flow, but raised by someone who witnessed the accident (no family email, since they
   aren't the victim). Includes a free-text description field.
3. **Radius escalation** (`backend/jobs/radiusEscalationJob.js`): a cron job runs every
   minute; for any alert still `pending` after `ESCALATION_INTERVAL_MINUTES`, it grows the
   search radius by `RADIUS_STEP_KM` (up to `MAX_VOLUNTEER_RADIUS_KM`) and notifies any newly
   in-range, available volunteers who haven't already been notified.
4. **Volunteer accepts** (`POST /api/volunteer/alerts/:id/accept`): alert status flips to
   `accepted`, the reporter is notified in real time with the volunteer's name/phone, and all
   other previously-notified volunteers are told the alert has been handled.
5. **Hospital side**: hospitals register/login separately and manage `totalBeds`,
   `availableBeds`, and a multi-select `facilities` list from their own dashboard — this is
   exactly what powers the "nearby hospitals" cards shown to users and on each alert.

## Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally, or a MongoDB Atlas connection string

### 1. Backend

```bash
cd backend
cp .env.example .env       # then edit MONGO_URI, JWT_SECRET, EMAIL_* etc.
npm install
npm run seed                # optional: inserts 6 sample hospitals around Varanasi
npm run dev                  # starts API + Socket.IO on http://localhost:5000
```

If `EMAIL_USER`/`EMAIL_PASS` are left blank in `.env`, SOS emails are simply logged to the
backend console instead of actually being sent — useful for local testing without setting up
SMTP. For Gmail, use an **App Password** (not your normal password) as `EMAIL_PASS`.

### 2. Frontend

```bash
cd frontend
cp .env.example .env       # defaults to http://localhost:5000, change if needed
npm install
npm run dev                  # starts the app on http://localhost:5173
```

### 3. Try it out
- Sign up as a normal user, add a family member's email, and optionally opt in as a
  volunteer.
- Open a second browser (or incognito window), sign up as a *second* user, opt in as a
  volunteer, and toggle "Available for help" on the Volunteer Hub page.
- From the first account's dashboard, press and hold the SOS button — the second
  account should get a real-time toast + notification and can accept it.
- Register a hospital account (or use a seeded one, password `hospital123`) to see bed
  availability reflected live on the user dashboard's hospital list.

## Environment variables reference

See `backend/.env.example` and `frontend/.env.example` for the full list, including the
tunable SOS/volunteer matching constants (`INITIAL_VOLUNTEER_RADIUS_KM`, `RADIUS_STEP_KM`,
`MAX_VOLUNTEER_RADIUS_KM`, `HOSPITAL_SEARCH_RADIUS_KM`, `ESCALATION_INTERVAL_MINUTES`).

## Notes & possible extensions
- SMS delivery (e.g. Twilio) can be added alongside the existing email service in
  `backend/utils/emailService.js` without changing any other part of the flow.
- The volunteer matching logic and hospital geo-queries both use MongoDB's `2dsphere`
  index with `$centerSphere`, which is index-accelerated and doesn't require any paid
  geocoding/maps API.
