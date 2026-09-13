# 🐾 FaunaNet

> **Hyperlocal Animal Rescue, Healthcare, and Welfare Coordination Platform**

---

## 📌 Overview

FaunaNet is a hyperlocal digital platform that connects citizens, volunteers, NGOs, veterinarians, shelters, and municipal authorities into a unified coordination ecosystem for street animal rescue, healthcare tracking, foster/adoption management, and local animal welfare operations.

---

## 🎯 Problem

Street animal welfare in urban and semi-urban communities suffers from fragmented communication and lack of coordinated response infrastructure. FaunaNet addresses:

- **Fragmented emergency communication**: Citizens cannot easily reach active rescue teams or available shelters in real time.
- **No centralized health records**: Animal medical histories, vaccination status, and sterilization logs are scattered across separate organizations.
- **Limited stakeholder visibility**: NGOs, municipal bodies, veterinarians, and volunteers operate in silos without shared situational awareness.
- **Delayed rescue responses**: Without real-time dispatch and SLA tracking, rescue requests go uncoordinated or unresolved.
- **No follow-up tracking**: Animals released after treatment or foster care lack centralized oversight.

---

## ✨ Key Features

All features listed below are implemented in the current codebase.

### 🚨 Rescue & SOS Coordination
- **One-touch SOS Reporting**: Citizens submit emergency rescue reports via a GPS-enabled modal with photo upload and real-time triage labelling.
- **Active Dispatch Panel**: Displays the highest-priority active rescue task with a live SLA countdown timer, responder status, escalation controls, and an in-app communication bridge for quick check-in messages.
- **Status Progression**: Rescue cases advance through states — Reported → Dispatched → Accepted → En Route → In Progress → Stabilized — with backend persistence.
- **Escalation**: SLA-expired dispatches trigger escalation actions handled by the backend dispatch controller.

### 🗺️ Interactive Rescue Map
- **Live Leaflet Map**: Displays all active rescue reports as colour-coded markers (red = Critical, orange = High, green = Verified).
- **GPS & Manual Positioning**: Auto-detects user GPS location with graceful degradation to click-to-pin for denied/unavailable geolocation.
- **Report Feed**: A sidebar list of the latest rescue cases with click-to-centre navigation on the map.
- **Proximity Circle**: Visual radius overlay around the selected active task.

### 🏥 Animal Health & Medical Records
- **Medical Record Dashboard**: Veterinarians and NGOs can create and view animal medical treatment entries with examination findings, diagnosis, treatment administered, attending vet, and discharge status.
- **Role-gated Access**: Only users with `vet`, `ngo`, or `admin` roles can add medical entries.
- **EHR Linking**: Medical records are linked to animal profiles in the database via `animalId`.
- **Discharge Status Tracking**: Animals transition through `in_care → ready_for_shelter → released_to_wild → ready_for_adoption`.

### 🏠 Foster Hub
- **Available Animals Listing**: Displays animals flagged as `available_for_foster` from the database, including species, age, location, and photographs.
- **Foster Application Form**: Prospective foster parents submit applications including housing type, duration, other-pets disclosure, and experience description.
- **Application Tracking**: Logged-in users can view their own foster application history with current status (`PENDING`, `UNDER_REVIEW`, `APPROVED`, `PLACED`, `REJECTED`, `COMPLETED`).

### 🔍 Lost & Found Network
- **Report Submission**: Users submit lost or found pet listings with species, identifying marks, last seen location, contact details, and optional photo.
- **Filterable Directory**: Browse reports by type (LOST/FOUND) and species.
- **Proximity Match Search**: Triggers a backend match query that returns nearby matching reports within 10 km with confidence scores and distances.

### 🏛️ Municipal & NGO Dashboard
- **Population & Welfare Metrics**: Displays real-time statistics from the database including total animals tracked, sterilized and vaccinated counts with coverage percentages, and total shelter capacity.
- **ABC/CNVR Campaign Management**: NGOs, vets, shelters, and admins can create and track Animal Birth Control sterilization campaigns with target areas, batch numbers, progress bars, and per-animal status tracking.

### 📦 Shelter & Asset Inventory
- **Asset Registry**: Register and track operational assets — vehicles, medical kits, equipment, infrastructure — with availability status.
- **Shelter Capacity Dashboard**: Aggregates total capacity and occupied beds across all registered shelters, displaying free bed count in real time.

### 🌐 Ecosystem Node Directory
- **Node Registry**: Register and browse verified local responders, vets, shelters, transport providers, and volunteers with trust levels, response history, and status.
- **Rescue Credit Dashboard**: Tracks verified completed rescues and trust scores across the network.
- **Proof Audit Log**: Searchable immutable log of rescue operations with verification status.
- **Messenger Sync Settings**: Configure WhatsApp, Telegram, and Discord report import queues (toggle-based, with human review requirement).

### 💬 Real-Time Sector Chat
- **Socket.io Powered**: Fully functional real-time messaging using Socket.io with a persistent backend message store in MongoDB.
- **Sector-Based Rooms**: Users join location-based rooms (Global, North area, South area, NGO verified) and exchange live messages.
- **Message History**: Messages are persisted to the database and retrieved on connection.

### 🌍 Multilingual Interface
- **8 Languages Supported**: English, Hindi, Bengali, Gujarati, Marathi, Punjabi, Tamil, Telugu — fully integrated via i18next with browser language auto-detection.

### 🎓 Training Center
- **Module-Based Training**: Sequential training modules (Emergency Assessment, Handling, First Aid, Community Moderation) with XP point rewards and badge unlocks.
- **Progress Tracking**: Completion state persisted to user profiles in the backend.

### 🛡️ Admin Operations Dashboard
- **Role Verification Queue**: Admins review and approve/reject citizen applications for elevated roles (volunteer, NGO, vet, shelter).
- **User Management**: Full directory of all platform users with role, verification status, and trust scores.
- **Audit Trail**: Immutable log of sensitive operations — logins, role changes, verification decisions.
- **Duplicate Report Flagging**: Admin view of reports flagged as potential duplicates.

---

## 🚧 Roadmap

Planned features not yet implemented:

- 🤖 **AI Photo Matching**: Visual AI matching between lost pet reports and found/community sighting photographs.
- 📱 **Offline PWA / Service Worker**: Offline form submission with background sync for field responders.
- 📣 **Automated Alert Radius**: SMS/WhatsApp push notifications to volunteers within a configurable radius when a new SOS is submitted.
- 💳 **Payment Gateway**: Secure donation processing with automated receipts for NGOs and shelters.
- 🗺️ **Live Shelter Map Layer**: Shelter and clinic locations overlaid as a separate map layer on MapView.

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | v19 | UI framework |
| Vite | v8 | Build tool |
| Leaflet + React-Leaflet | v1.9 / v5 | Rescue mapping |
| Three.js + React Three Fiber | v0.184 / v9 | 3D hero background |
| Framer Motion | v12 | Animations |
| i18next + react-i18next | v26 / v17 | Multilingual (8 languages) |
| socket.io-client | v4.8 | Real-time chat |
| Lucide React | v1.14 | Icons |
| Axios | v1.16 | HTTP API client |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | LTS | Runtime |
| Express.js | v5 | API server |
| MongoDB + Mongoose | v9 | Database + ORM |
| Socket.io | v4.8 | WebSocket server |
| JSON Web Tokens | v9 | Authentication |
| bcryptjs | v3 | Password hashing |

---

## 📁 Project Structure

```text
FaunaNet/
├── .env.example              # Environment variables template
├── .gitignore
├── LICENSE                   # MIT License
├── README.md
├── index.html
├── package.json              # Frontend dependencies & scripts
├── vite.config.js
├── vercel.json               # Vercel SPA deployment config
│
├── public/
│   ├── favicon.svg
│   └── icons.svg
│
├── src/
│   ├── assets/               # Images and static assets
│   ├── components/
│   │   ├── Community/        # Real-time sector Chat (Socket.io)
│   │   ├── InteractiveLayer/ # 3D animated hero scene (Three.js)
│   │   ├── ActiveDispatchPanel.jsx
│   │   ├── AnimalProfileModal.jsx
│   │   ├── ConstellationBackground.jsx
│   │   ├── Layout.jsx
│   │   └── SOSReportModal.jsx
│   ├── config/               # Language list config
│   ├── context/              # Global AppContext (auth, tasks, ecosystem state)
│   ├── pages/
│   │   ├── AdminDashboard.jsx
│   │   ├── AssetInventory.jsx
│   │   ├── Auth.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Ecosystem.jsx
│   │   ├── FosterHub.jsx
│   │   ├── HealthDashboard.jsx
│   │   ├── LostFoundView.jsx
│   │   ├── MapView.jsx
│   │   ├── MunicipalDashboard.jsx
│   │   ├── TaskBoard.jsx
│   │   └── TrainingCenter.jsx
│   ├── services/
│   │   ├── api.js            # Axios API service layer
│   │   └── socket.js         # Socket.io client connection
│   └── translations/         # en, hi, bn, gu, mr, pa, ta, te
│
└── server/
    ├── index.js              # Express app + Socket.io server entry
    ├── package.json
    ├── controllers/          # Route handlers (auth, animals, dispatch, vet, ABC, admin...)
    ├── middleware/           # JWT authentication middleware
    ├── models/               # Mongoose schemas
    │   ├── Animal.js
    │   ├── AnimalSighting.js
    │   ├── ABCCampaign.js
    │   ├── AdoptionApplication.js
    │   ├── Asset.js
    │   ├── AuditLog.js
    │   ├── Caregiver.js
    │   ├── Donation.js
    │   ├── FaunaNode.js
    │   ├── FosterApplication.js
    │   ├── Group.js
    │   ├── LostFoundReport.js
    │   ├── MedicalRecord.js
    │   ├── Message.js
    │   ├── Notification.js
    │   ├── Organization.js
    │   ├── Report.js
    │   ├── RescueLog.js
    │   ├── Shelter.js
    │   ├── Task.js
    │   ├── User.js
    │   └── UserSettings.js
    ├── routes/               # Express route definitions
    ├── utils/                # DB fallback utilities
    └── tests/                # API test suite
```

---

## ⚙️ Installation & Setup

### Prerequisites

- **Node.js** v18+ and **npm** v9+
- **MongoDB** — local instance or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster

### Clone

```bash
git clone https://github.com/HimadriKumariSinha/FaunaNet.git
cd FaunaNet
```

### Option A: Full-Stack Concurrent (Recommended)

```bash
# Install root frontend dependencies
npm install

# Install backend dependencies
cd server && npm install && cd ..

# Run both frontend + backend concurrently
npm run dev
```

### Option B: Separate Services

#### Frontend only
```bash
npm install
npm run dev:client
# → http://localhost:5173
```

#### Backend only
```bash
cd server
npm install
npm start
# → http://localhost:5000
```

---

## 🔐 Environment Variables

Copy `.env.example` and fill in your values.

### Backend (`server/.env`)

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend (`.env` in project root)

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

> ⚠️ Never commit real `.env` files. They are listed in `.gitignore`.

---

## 🚀 Deployment

### Frontend — Vercel
A `vercel.json` SPA routing config is included. Connect the GitHub repository in the Vercel dashboard or use the Vercel CLI.

### Backend — Render / Railway / VPS
Deploy the `server/` directory to any Node.js host. Configure all environment variables in your host's dashboard and set the start command to `npm start`.

---

## 🤝 Contributing

Contributions are welcome. Please:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "Add: your feature description"`
4. Push and open a Pull Request.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

Copyright © 2026 HimadriKumariSinha
