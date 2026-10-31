# 🐾 BrunoVerse: Care • Connect • Create Change

BrunoVerse is one platform for **pet owners** and **animal rescuers**. You can report an injured or sick animal with GPS, photos and video, alert nearby rescuers, track the rescue live, find nearby vets/NGOs/shelters, book vet consultations, keep pet health records, and get AI first-aid steps while help is on the way.

*Team IDEAForge 2026*

---

## 🧱 Tech stack
| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript (no build step), Leaflet + OpenStreetMap maps |
| Backend | Java 17, Spring Boot 3 (REST API, Spring Data JPA, BCrypt) |
| Database | MySQL (production) / H2 (zero-setup local run) |
| AI | Built-in emergency triage + first-aid engine (English, Hindi, Hinglish); optional Google Gemini |

## 📁 Project structure
```
brunoverse/
├── frontend/                 Web app (open index.html, or let the backend serve it)
│   ├── index.html
│   ├── css/style.css
│   ├── assets/logo.svg
│   └── js/
│       ├── config.js         Backend URL (auto-detected by default)
│       ├── api.js            REST client + live sync with the backend
│       ├── store.js          Local data + demo seed data + media storage
│       ├── geo.js            GPS, distance, maps, real vets from OpenStreetMap
│       ├── ai.js             First-aid knowledge base & triage
│       ├── ui.js             Layout and shared components
│       ├── pages-auth.js     Login / sign-up (5 account types)
│       ├── pages-owner.js    Owner pages: home, pets, report, find help, vet booking
│       ├── pages-rescuer.js  Rescuer pages: dashboard, nearby cases, requests, rescues, directory
│       ├── pages-shared.js   Case detail, AI chat, community, messages, opportunities, settings
│       ├── pages-legal.js    Privacy Policy, Terms of Use, Admin (verify vets/NGOs/rescuers)
│       └── app.js            Router + live updates
│   ├── manifest.webmanifest, sw.js   Installable app (PWA)
├── backend/                  Spring Boot REST API
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/brunoverse/
│       │   ├── BrunoverseApplication.java
│       │   ├── config/       CORS, login-token check (AuthInterceptor), JSON converters
│       │   ├── model/        JPA entities (User, RescueCase, Pet, Place, Appointment, …)
│       │   ├── repository/   Spring Data repositories
│       │   ├── service/      AiService, GeoService, TokenService (login tokens), PolicyService (who may see/change what)
│       │   └── controller/   REST controllers
│       └── resources/
│           ├── application.properties         (local: H2 + demo data)
│           ├── application-mysql.properties   (local MySQL)
│           └── application-prod.properties    (launch: hosted MySQL, no demo data)
├── database/schema.sql       MySQL schema (tables are also auto-created)
├── Dockerfile                One container: API + website
└── render.yaml               Render Blueprint (free hosting)
```

## ▶️ Run it

### 1. Backend + frontend together (recommended)
You need **Java 17+** and **Maven** (or just open the `backend` folder in IntelliJ IDEA and run `BrunoverseApplication`).
```bash
cd backend
mvn spring-boot:run
```
Open **http://localhost:8080**. The backend serves the frontend too. The top bar shows a green **Live** badge when the app is connected to the server.

On the first run the database is filled with demo data automatically.

### 2. Use MySQL instead of H2
```bash
# MySQL must be running. The "brunoverse" database is created automatically.
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=mysql
# custom credentials:
DB_USER=root DB_PASSWORD=yourpassword mvn spring-boot:run -Dspring-boot.run.profiles=mysql
```

### 3. Frontend only (no backend)
Double-click `frontend/index.html`, or run `npx serve frontend`. Everything still works, but data stays in that browser (the badge shows **Offline**).

## 👤 Demo accounts
| Role | Email | Password |
|---|---|---|
| Pet Owner | anushka@demo.in | demo123 |
| Rescuer | rohit@demo.in | demo123 |

New users can sign up as **Pet Owner, Rescuer, Feeder/Volunteer, Veterinarian or NGO**.

## 🎬 Live demo flow
1. **Phone/laptop 1:** log in as Anushka. Go to **Report Animal**, let GPS find you, pick *Bleeding / Accident*, add a photo or video, and press **Send alert**. AI quick first-aid steps appear instantly, and nearby rescuers are shown with their phone numbers.
2. **Device 2:** log in as Rohit. The case appears in **Rescue Requests** with the photo/video, reason, location and distance. Press **Accept** (the server stops two rescuers from taking the same case).
3. Rohit taps **I'm on the way**, then **▶ Simulate journey**. On device 1 the tracker moves live (*Reported → Rescuer assigned → On the way → Reached → Treatment → Safe*) and the rescuer's pin moves on the map.
4. **Mark safe & resolved**. A celebration plays and Rohit's stats update.

> To use real GPS and the camera on phones, open the app over **https** (deploy it, see below) or on `localhost`.

## ✨ Features
**Pet owners:** dashboard • report an animal in need (GPS + draggable pin, photos & videos, voice input) • nearest rescuers with call buttons • live rescue tracker • find nearby help (vets, NGOs, shelters, 24×7 filter, real vets from OpenStreetMap) • vet booking (clinic, home visit, video call) • pet profiles with vaccinations, medical records, reminders and an AI health summary

**Rescuers:** stats (pending, active, completed, total helped) • nearby rescue requests with photo, reason, location and distance • quick actions • active rescue map • accept → status updates → live location • recent activity • messages • Vets & NGOs directory with organisation registration

**For everyone:** AI First Aid chat covering 15 emergencies (bleeding, accident, fracture, poisoning, heatstroke, seizure, choking/CPR, burns, maggot wounds, snake bite, eye injury, abandoned puppies, hungry strays, injured birds) • **Every Rescue Matters** page (stories, volunteer opportunities, start a rescue team, become a rescuer) • community feed and care/feeding guides • messages with photos • notifications • search • mobile-friendly with an SOS button

## 🔌 REST API (base URL `http://localhost:8080`)
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Server status |
| POST | `/api/auth/signup` | Create account (password stored as a BCrypt hash) |
| POST | `/api/auth/login` | Log in with email/phone + password |
| POST | `/api/cases` | Report an animal (server runs AI triage and notifies rescuers) |
| GET | `/api/cases/nearby?lat=&lng=&radiusKm=10` | Open cases near a GPS point (most urgent first) |
| GET | `/api/cases?status=&reporterId=&rescuerId=` | List cases |
| POST | `/api/cases/{id}/accept` | Rescuer accepts (409 if already taken) |
| PATCH | `/api/cases/{id}/status` | `on_the_way`, `reached`, `treatment`, `resolved` |
| POST | `/api/cases/{id}/location` | Rescuer's live location |
| GET | `/api/places/nearby?lat=&lng=&type=vet` | Nearest vets, NGOs, shelters, rescuers |
| POST | `/api/places` | Register an organisation (unverified until reviewed) |
| GET | `/api/pets?ownerId=` · `/api/pets/{id}/summary` | Pet profiles & health summary |
| POST | `/api/ai/triage` | `{"text": "dog bleeding after accident"}` → urgency + first-aid steps |
| POST | `/api/media` · GET `/api/media/{file}` | Upload / stream photos & videos |
| GET | `/api/bootstrap` | All app data in one call (used by the web app) |
| PUT / DELETE | `/api/data/{collection}/{id}` | Sync any record (pets, cases, threads, posts…) |

Example:
```bash
curl -X POST localhost:8080/api/ai/triage -H "Content-Type: application/json" -d '{"text":"kutte ke pair se khoon aa raha hai"}'
```
The H2 database console is at `http://localhost:8080/h2-console` (JDBC URL `jdbc:h2:file:./data/brunoverse`, user `sa`).

## 🚀 Launch (production) – free hosting
| Part | Free service | Why |
|---|---|---|
| App (API + website) | **Render** free web service (`render.yaml` + root `Dockerfile`) | 512 MB, HTTPS, custom domain; sleeps after 15 min idle |
| Database | **Aiven** free MySQL (1 GB, backups, no card) – or TiDB Cloud Starter | Real MySQL, same as local |
| Photos & videos | **Cloudinary** free plan (browser uploads with an unsigned preset) | Render's disk is wiped on restart |
| Keep awake | **cron-job.org** pings `/api/health` every 10 min | Avoids the 1-minute wake-up |

The full click-by-click steps are in the **BrunoVerse Launch Guide**.

Production environment variables (Render → Environment):

| Variable | Value |
|---|---|
| `JDBC_URL` | `jdbc:mysql://HOST:PORT/defaultdb?sslMode=REQUIRED` (from Aiven) |
| `DB_USER`, `DB_PASSWORD` | From Aiven (`avnadmin` + password) |
| `JWT_SECRET` | Generated by Render (signs login tokens) |
| `ADMIN_EMAILS` | Your email; that account can verify vets, NGOs and rescuers at `#/admin` |
| `DEMO_DATA` | `false`: starts with an empty database, no sample users |

Railway also works: use its `MYSQL*` variables instead of `JDBC_URL`/`DB_USER`/`DB_PASSWORD`, and set `UPLOAD_DIR=/data/uploads` on a volume.

Before launch, edit `frontend/js/config.js`: your Cloudinary cloud name + upload preset, and your name, contact email and city (shown on the Privacy Policy and Terms pages).

**Security model:** users log in with a signed token (30 days). Each user sees only their own pets, bookings, notifications and conversations. Phone numbers are shown only for helpers who chose to be available, and for the reporter of a case. Only an admin can mark someone as **Verified**.

## 🛣️ Next steps
Push notifications / SMS alerts to rescuers • rate limiting on login and reports • WebSocket live tracking (instead of polling) • document upload for verification • mobile app

## ⚠️ Disclaimer
AI guidance is first aid only and does not replace a veterinarian. The phone numbers of the demo clinics and NGOs are placeholders. Replace them with verified local partners before going live.
