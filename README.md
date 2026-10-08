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

## 🌐 Production Deployment

### Frontend (Vercel)
1. Push this repository to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. Set the **Root Directory** to `frontend`.
4. Configure Environment Variables in Vercel:
   - `VITE_API_BASE_URL`: `https://your-backend-api.onrender.com`
   - `VITE_GOOGLE_CLIENT_ID`: Your Google OAuth Client ID
5. Deploy.

### Backend (Render / Railway / AWS / VPS)
1. Set the following environment variables:
   - `DATABASE_URL`: `jdbc:mysql://<db-host>:<port>/brunoverse`
   - `DATABASE_USERNAME`: Your DB user
   - `DATABASE_PASSWORD`: Your DB password
   - `JWT_SECRET`: 32+ character random secret
   - `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID
   - `GOOGLE_CLIENT_SECRET`: Your Google OAuth Client Secret
   - `GOOGLE_MAPS_API_KEY`: Your Google Maps API Key (optional)
2. Build and run:
   ```bash
   mvn clean package -DskipTests
   java -jar target/brunoverse-0.0.1-SNAPSHOT.jar
   ```

---

## 📄 License
This project is licensed under the MIT License — feel free to contribute and make a difference for animals! 🐶🐱
