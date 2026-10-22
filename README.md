# 🐾 BrunoVerse — Animal Welfare & Community Platform

> **"Care • Connect • Create Change"**  
> A full-stack community-driven platform for animal rescue, veterinary care, pet health management, and public education.

---

## 🌟 Overview

**BrunoVerse** is a modern, full-stack animal welfare platform that unifies pet owners, animal rescuers, certified veterinarians, welfare NGOs, and community volunteers into a single cohesive ecosystem.

From reporting animals in distress with real-time GPS coordinates, to finding real nearby veterinary hospitals, managing pet medical history and vaccine schedules, sharing rescue stories, and learning veterinary-approved care techniques, BrunoVerse empowers communities to make a measurable difference.

---

## ✨ Key Features

1. **Role-Based Portals & Dashboards**
   - **Pet Owner Portal:** Pet management, health records, vaccination schedules, personalized reminders, and emergency care.
   - **Rescuer Portal:** Real-time animal rescue reporting, urgency dispatch tags, GPS map coordinates, status lifecycle tracking (`REPORTED` → `ASSIGNED` → `RESCUED` → `IN_CARE` → `REHOMED`).
   - **Veterinarian Portal:** Clinic inquiries, medical record logging, patient history, and health updates.
   - **NGO & Volunteer Portal:** Shelter intake, foster matchmaking, volunteer coordination, and community events.

2. **Real Nearby Veterinary Clinics**
   - Live location integration: asks user for GPS location permission.
   - Search by **City**, **Area**, **PIN code**, or **Clinic Name**.
   - Direct phone dialing (`tel:`), Google Maps navigation (`maps/dir`), website links, open/closed badges, and real-time distance calculations.
   - Google Places API backend proxy (keys never exposed to the frontend) with reliable live OSM Overpass and database fallbacks.

3. **Article-Based Veterinary Learning Center**
   - Professional, article-based animal healthcare portal across 9 core categories:
     - *Pet Care*
     - *Pet Nutrition*
     - *Vaccination*
     - *First Aid*
     - *Animal Rescue*
     - *Responsible Pet Ownership*
     - *Dog Care*
     - *Cat Care*
     - *Emergency Care*
   - Peer-reviewed clinical articles with detailed paragraphs, key points, practical tips, emergency warning alerts, and "Learn More" sections.
   - Search bar, category filters, interactive reading modal, bookmarking, and native Web Share.

4. **Community Forum & Social Feed**
   - Share animal stories, rescue updates, adoption announcements, and questions.
   - Image upload support, upvoting/liking, and threaded comments.

5. **Authentication & Security**
   - Standard email/password registration with BCrypt hashing.
   - Google OAuth 2.0 / OpenID Connect ID token verification with Google Identity Services (GIS).
   - Stateless JWT authentication with role authorization.
   - Structured JSON error handling across all APIs (never raw HTML errors or `[object Object]`).

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19 + Vite
- **Routing:** React Router v7
- **Styling:** CSS Design Tokens + Responsive Grid / Glassmorphism UI
- **Icons:** Lucide React
- **Maps:** Leaflet & React-Leaflet
- **HTTP Client:** Axios (with Bearer token interceptor)
- **Authentication:** Google Identity Services (GIS) + JWT

### Backend
- **Language & Runtime:** Java 21
- **Framework:** Spring Boot 4.0.0
- **Security:** Spring Security (Stateless JWT Filter, BCrypt Password Encoder)
- **Data & Persistence:** Spring Data JPA / Hibernate
- **Database:** MySQL / MariaDB (production-ready)
- **External Integrations:** Google OAuth TokenInfo & JWKS verification, Google Places API
- **Build Tool:** Apache Maven 3.9+

---

## 📂 Project Structure

```
brunoVerse/
├── src/main/java/com/brunoverse/
│   ├── config/              # SecurityConfig, CorsConfig, JwtUtil, DataInitializer, GlobalExceptionHandler
│   ├── controller/          # REST Controllers (Auth, User, Animal, VetClinic, HelpProvider, Rescue, Community)
│   ├── dto/                 # Request/Response DTOs (LoginResponse, VetClinicDto, ErrorResponse, etc.)
│   ├── entity/              # JPA Entities (User, Animal, RescueRequest, HelpProvider, CommunityPost, etc.)
│   ├── enums/               # UserRole, AnimalType, RescueStatus, Gender, Urgency
│   ├── repository/          # Spring Data JPA Repositories
│   └── service/             # Business Logic & Integrations (GoogleAuthService, VetPlacesService)
├── src/main/resources/
│   └── application.properties # Spring configuration (env-driven)
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios API modules (authApi, animalApi, vetApi, rescueApi, etc.)
│   │   ├── components/      # Common UI, Modals, LeafletMap, Illustrations
│   │   ├── context/         # AuthContext (JWT management & session sync)
│   │   ├── data/            # Educational articles knowledge base (learningArticles.js)
│   │   ├── pages/           # WelcomePage, LoginPage, RegisterPage, LearningPage, NearbyHelpPage, Dashboards
│   │   ├── utils/           # errorHandler.js, googleAuth.js, avatarHelper.js
│   │   ├── App.jsx          # Routing & protected routes
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── .env.example             # Template for required environment variables
├── pom.xml                  # Maven dependencies & build configuration
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Java 21 JDK** installed (`java -version`)
- **Maven 3.9+** installed (`mvn -version`)
- **Node.js 18+** & **npm** installed (`node -v`, `npm -v`)
- **MySQL 8.0+** or **MariaDB 10.11+** running

---

### 1. Database Setup

Create the MySQL database:

```sql
CREATE DATABASE brunoverse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

### 2. Environment Variables Setup

Copy `.env.example` to `.env` in the project root:

```bash
cp .env.example .env
```

Configure the values:

```env
# Server & Database
PORT=8080
DATABASE_URL=jdbc:mysql://localhost:3306/brunoverse?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true
DATABASE_USERNAME=root
DATABASE_PASSWORD=YourDatabasePassword
JWT_SECRET=your_32_character_super_secure_jwt_secret_key

# Google OAuth 2.0 (from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback

# Google Maps / Places (Optional Server-Side Key for Live Places API)
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Frontend (Vite)
VITE_API_BASE_URL=http://localhost:8080
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

---

### 3. Backend Setup & Run


1. Open a terminal in the root folder:
   ```bash
   mvn clean spring-boot:run
   ```
2. The backend server will start on port `8080`:
   - Health check: `http://localhost:8080/api/auth/google/config`
   - Initial verified clinics and test accounts are seeded automatically.

---

### 4. Frontend Setup & Run

1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. Vite dev server will launch at: `http://localhost:5173`

---

## 🔑 Google OAuth 2.0 Configuration

To enable Google Sign-In:
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Create an **OAuth 2.0 Client ID** (Web application).
3. Set **Authorized JavaScript origins**:
   - `http://localhost:5173`
   - `http://localhost:8080`
   - Your production frontend domain (e.g., `https://brunoverse.vercel.app`)
4. Set **Authorized redirect URIs**:
   - `http://localhost:5173/auth/google/callback`
   - Your production callback URL (e.g., `https://brunoverse.vercel.app/auth/google/callback`)
5. Copy the Client ID and Client Secret into your `.env` file.

---

## 🧪 Testing the Application

### Default Demo Accounts:
| Role | Email | Password |
|---|---|---|
| Pet Owner | `anushka@example.com` | `123456` |
| Rescuer | `rohit@example.com` | `123456` |
| Veterinarian | `dr.sharma@example.com` | `123456` |

---

## 🚂 Railway Production Deployment Guide

BrunoVerse is fully configured for deployment on [Railway](https://railway.app) using a single GitHub repository hosting three interconnected services:

```
┌────────────────────────┐      ┌────────────────────────┐      ┌────────────────────────┐
│    Frontend Service    │ ───> │    Backend Service     │ ───> │  MariaDB Service (DB)  │
│  (React 19 + Nginx)    │ HTTP │ (Spring Boot 4 / Java) │ JDBC │  (Persistent Storage)  │
└────────────────────────┘      └────────────────────────┘      └────────────────────────┘
                                            │
                                            v (Persistent Volume: /uploads)
                                ┌────────────────────────┐
                                │   Uploaded Media Disk  │
                                └────────────────────────┘
```

---

### Step 1: Provision the MariaDB Database
1. In your [Railway Dashboard](https://railway.app/dashboard), create a **New Project**.
2. Click **+ New** → **Database** → **Add MySQL** (or **MariaDB** template).
3. Once provisioned, note the private connection variables:
   - `MYSQLDATABASE` / `MYSQL_DATABASE`
   - `MYSQLUSER` / `MYSQL_USER`
   - `MYSQLPASSWORD` / `MYSQL_PASSWORD`
   - `MYSQLHOST` / `MYSQL_HOST`
   - `MYSQLPORT` / `MYSQL_PORT`
4. The JDBC connection URL format is:
   ```
   jdbc:mysql://${{MySQL.MYSQLHOST}}:${{MySQL.MYSQLPORT}}/${{MySQL.MYSQLDATABASE}}?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true
   ```

---

### Step 2: Deploy the Backend Service
1. In the same Railway project, click **+ New** → **GitHub Repo** → select your `brunoVerse` repository.
2. In the service **Settings**:
   - **Root Directory:** `/` (leave as root)
   - **Build:** Railway detects `Dockerfile` automatically (multi-stage Maven + Temurin JRE 21).
   - **Healthcheck Path:** `/api/health`
3. In **Variables**, add:
   | Variable | Value |
   |---|---|
   | `PORT` | `8080` |
   | `DATABASE_URL` | `jdbc:mysql://${{MySQL.MYSQLHOST}}:${{MySQL.MYSQLPORT}}/${{MySQL.MYSQLDATABASE}}?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true` |
   | `DATABASE_USERNAME` | `${{MySQL.MYSQLUSER}}` |
   | `DATABASE_PASSWORD` | `${{MySQL.MYSQLPASSWORD}}` |
   | `JWT_SECRET` | A secure random 32+ character key |
   | `UPLOAD_DIR` | `/uploads` |
   | `GEMINI_API_KEY` | Your Google Gemini Vision API key |
   | `GEMINI_MODEL` | `gemini-2.5-flash` |
   | `GOOGLE_CLIENT_ID` | Your Google OAuth 2.0 Web Client ID |
   | `GOOGLE_CLIENT_SECRET` | Your Google OAuth 2.0 Client Secret |
   | `GOOGLE_REDIRECT_URI` | `https://<YOUR-FRONTEND-DOMAIN>/auth/google/callback` |
4. In **Volumes**:
   - Add a persistent volume mounted at `/uploads` so uploaded pet and rescue photos survive container restarts.
5. In **Networking**:
   - Click **Generate Domain** (e.g. `https://brunoverse-backend-production.up.railway.app`).

---

### Step 3: Deploy the Frontend Service
1. Click **+ New** → **GitHub Repo** → select the same `brunoVerse` repository.
2. In the service **Settings**:
   - **Service Name:** `brunoverse-frontend`
   - **Root Directory:** `frontend`
   - **Build:** Railway detects `frontend/Dockerfile` (Node 20 build + Nginx with SPA fallback).
3. In **Variables**:
   | Variable | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `https://<YOUR-BACKEND-DOMAIN>` (e.g. `https://brunoverse-backend-production.up.railway.app`) |
   | `VITE_GOOGLE_CLIENT_ID` | Your Google OAuth Client ID |
4. In **Networking**:
   - Click **Generate Domain** (e.g. `https://brunoverse.up.railway.app`).

---

### Step 4: Finalize Google Cloud OAuth Credentials
In [Google Cloud Console](https://console.cloud.google.com/apis/credentials):
- **Authorized JavaScript origins:**
  - `https://<YOUR-FRONTEND-DOMAIN>` (e.g., `https://brunoverse.up.railway.app`)
- **Authorized redirect URIs:**
  - `https://<YOUR-FRONTEND-DOMAIN>/auth/google/callback`

---

## 📄 License
This project is licensed under the MIT License — feel free to contribute and make a difference for animals! 🐶🐱
