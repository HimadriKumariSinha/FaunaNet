# 🐾 FaunaNet

> **Hyperlocal Animal Rescue, Healthcare, and Welfare Coordination Platform**

FaunaNet connects citizens, volunteers, NGOs, veterinarians, shelters, and municipal authorities into a unified digital ecosystem to streamline street animal rescue, healthcare tracking, foster/adoption management, and local welfare operations.

---

## 📌 Overview

Street animal welfare in urban and semi-urban communities often suffers from fragmented communication, uncoordinated emergency responses, and lack of centralized health records. **FaunaNet** bridges these gaps by offering a real-time, hyperlocal platform where emergency SOS alerts, rescue dispatches, veterinary logs, foster applications, and community sightings seamlessly integrate into actionable workflows.

---

## 🎯 Problem

FaunaNet directly addresses critical real-world challenges in animal welfare:

* **Fragmented Rescue Communication**: Citizens struggle to find nearby active rescue teams or available shelters during emergencies.
* **Delayed Response Times**: Lack of real-time dispatch tracking leads to uncoordinated or missed rescue requests.
* **Absence of Centralized Records**: Animal medical histories, vaccination status, and sterilization logs are often lost across separate organizations.
* **Limited Stakeholder Visibility**: NGOs, municipal bodies, private vets, and citizens operate in silos without shared situational awareness.
* **Unmonitored Follow-up Care**: Animals released after treatment or foster care lack centralized tracking mechanisms.

---

## ✨ Key Features

### 🚨 Rescue & SOS Coordination
* **Instant SOS Reporting**: Simple modal interface for citizens to submit emergency animal rescue reports.
* **Real-time Dispatch Management**: Active dispatch panel for assigning responders with SLA expiration countdowns.
* **Interactive Geo-Mapping**: Integrated Leaflet maps displaying live rescue reports, shelters, and responder locations.
* **Status Updates**: Live notifications and status progression tracking from dispatch to resolution.

### 🏥 Animal Health & Care
* **Electronic Health Records (EHR)**: Centralized digital profiles for rescued and sheltered animals.
* **Medical & Treatment Logs**: Track medical procedures, diagnoses, prescribed treatments, and follow-up schedules.
* **Vaccination & Sterilization Tracking**: Maintain verified records for rabies vaccinations and ABC treatments.
* **Veterinary Hub**: Dedicated portal for licensed veterinarians to update diagnostic records and treatment notes.

### 🏠 Foster & Adoption Hub
* **Adoption Listings**: Searchable catalog of animals eligible for adoption with health profiles and background logs.
* **Foster Application Workflow**: Online submission and tracking system for prospective foster parents.
* **Caregiver Logs**: Manage foster placements, home environment checks, and ongoing care updates.

### 🔍 Lost & Found Network
* **Lost Animal Reporting**: Register missing pets with detailed descriptions, last seen locations, and photos.
* **Community Sighting Logs**: Citizens can submit visual sightings and location pins to aid pet recovery.
* **Matching System**: Cross-reference lost reports with recent community sightings for faster reunions.

### 🏛️ Municipal & NGO Management
* **Street Animal Census**: Monitor local animal populations and distribution density.
* **ABC Campaign Management**: Coordinate Animal Birth Control (sterilization) drives and track target metrics.
* **Asset & Inventory Management**: Track emergency vehicles, medical equipment, traps, and shelter supplies.

### 🌍 Community & Collaboration
* **Multilingual Support**: Fully localized interface supporting 8 languages (English, Hindi, Bengali, Gujarati, Marathi, Punjabi, Tamil, Telugu).
* **Real-time Sector Chat**: Socket.io powered instant messaging for localized responder and volunteer communication.
* **Ecosystem Node Directory**: Interactive map and directory of verified local shelters, clinics, feeding points, and NGOs.

---

## 🚧 Roadmap

Features currently planned or in development:

* 🤖 **AI Sighting Matching**: Automatic visual matching between lost pet reports and community sighting photographs.
* 📱 **Offline PWA Capabilities**: Offline form submission with background synchronization for field responders.
* 💬 **Automated Alert Radius**: Instant SMS and WhatsApp notifications sent to registered volunteers within a 5km radius of an SOS alert.
* 💳 **Payment Gateway Integration**: Automated receipts and secure donation processing for registered NGOs and shelters.

---

## 🛠 Tech Stack

### Frontend
* **Core Framework**: React (v19)
* **Build Tool**: Vite (v8)
* **Styling**: Modern Custom CSS & Framer Motion
* **Mapping**: Leaflet & React-Leaflet
* **3D Visualizations**: Three.js & React Three Fiber
* **Localization**: i18next & react-i18next (8 supported languages)
* **Icons**: Lucide React

### Backend
* **Runtime**: Node.js
* **Server Framework**: Express.js (v5)
* **Database**: MongoDB with Mongoose ORM (v9)
* **Authentication**: JSON Web Tokens (JWT) & bcryptjs password hashing

### Real-Time Communication
* **WebSockets**: Socket.io & socket.io-client for real-time dispatch alerts and sector chat

---

## 📁 Project Structure

```text
FaunaNet/
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore configuration
├── LICENSE                   # MIT License
├── README.md                 # Project documentation
├── index.html                # Application entry HTML
├── package.json              # Frontend & root scripts
├── vite.config.js            # Vite configuration
├── vercel.json               # Vercel deployment configuration
│
├── public/                   # Public static assets & icons
│   ├── favicon.svg
│   └── icons.svg
│
├── src/                      # React Frontend Source Code
│   ├── assets/               # Media assets and visual graphics
│   ├── components/           # Reusable UI components
│   │   ├── Community/        # Real-time sector chat components
│   │   ├── InteractiveLayer/ # 3D background & hero scene
│   │   ├── ActiveDispatchPanel.jsx
│   │   ├── AnimalProfileModal.jsx
│   │   ├── SOSReportModal.jsx
│   │   └── Layout.jsx
│   ├── config/               # Language and app configurations
│   ├── context/              # Global React AppContext state
│   ├── pages/                # Main application views & dashboards
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
│   ├── services/             # Axios API client & Socket.io connections
│   └── translations/         # Translation JSON bundles (en, hi, bn, etc.)
│
└── server/                   # Node.js Express Backend Source Code
    ├── index.js              # Express app & Socket.io server entry point
    ├── package.json          # Server dependencies & scripts
    ├── controllers/          # Business logic controllers (SOS, Auth, ABC, Vets)
    ├── middleware/           # JWT auth and security middleware
    ├── models/               # Mongoose schemas (Animal, Report, User, Shelter, etc.)
    ├── routes/               # Express API endpoints
    ├── utils/                # Database fallbacks and utilities
    └── tests/                # API integration test suites
```

---

## ⚙️ Installation & Setup

### Prerequisites

Ensure you have the following installed on your system:
* **Node.js** (v18.0.0 or higher recommended)
* **npm** (v9.0.0 or higher)
* **MongoDB** (Local instance or MongoDB Atlas cluster)

### Clone the Repository

```bash
git clone https://github.com/HimadriKumariSinha/FaunaNet.git
cd FaunaNet
```

### Option A: Full-Stack Concurrent Setup (Recommended)

Run both the React frontend and Node.js backend concurrently from the root directory:

```bash
# 1. Install root dependencies
npm install

# 2. Install server dependencies
cd server && npm install && cd ..

# 3. Start both frontend & backend concurrently
npm run dev
```

### Option B: Individual Service Setup

#### Frontend Setup
```bash
npm install
npm run dev:client
```
The frontend will be available at `http://localhost:5173`.

#### Backend Setup
```bash
cd server
npm install
npm start
```
The backend API server will run on `http://localhost:5000`.

---

## 🔐 Environment Variables

Create environment configuration files using the provided `.env.example` templates.

### Backend (`server/.env`)

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/faunanet?retryWrites=true&w=majority
JWT_SECRET=your_secure_jwt_secret_key_here
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend (`.env`)

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

> ⚠️ **Security Warning**: Never commit actual `.env` files or API secrets to public version control. Ensure `.env` is listed in your `.gitignore`.

---

## 🚀 Deployment

### Vercel (Frontend)
The repository includes a `vercel.json` configuration file pre-configured for client-side SPA routing. Deploy directly via the Vercel CLI or by connecting your GitHub repository to Vercel.

### Node.js Backend Host (Render / Railway / VPS)
Deploy the `server/` directory to Node.js hosting environments:
* Ensure environment variables (`MONGODB_URI`, `JWT_SECRET`, `PORT`) are configured in your host dashboard.
* Set the start command to `npm start`.

---

## 🤝 Contributing

Contributions from volunteers, developers, and animal welfare advocates are welcome!

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE).
