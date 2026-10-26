Prepared in accordance with the Orbitwick evaluation protocol.

# OrbitTrail — Personal Travel Photo Vault

OrbitTrail is a full-stack web application designed for travelers to securely register, authenticate, and curate their personal collection of travel memories. Every photo uploaded is automatically enriched with an AI-generated **wander brief** summary, protected by TOTP two-factor authentication, and isolated with strict ownership access control.

---

## 1. Tech Stack & Architectural Decisions

### Choice of Technology Stack
* **Framework:** Next.js 16 (App Router with Serverless API Routes)
* **Database:** MongoDB
* **Object Data Modeling (ODM):** Mongoose
* **Authentication:** JWT (Short-lived Access Token & Long-lived Refresh Token) with HTTP-only cookies and Bearer token compatibility
* **Two-Factor Authentication (2FA):** Time-based One-Time Password (TOTP) via `otplib` and `qrcode` (Issuer: `OrbitTrail`)
* **Password Hashing:** `bcryptjs` with 12 salt rounds
* **AI Summarization:** OpenRouter API (`meta-llama/llama-3.2-3b-instruct:free`) with an integrated semantic heuristic fallback engine
* **Image Storage:** Cloudinary with fallback to local disk storage (`/public/uploads`)
* **Email Verification:** Resend API with local console inspection fallback for development/testing
* **Styling:** Modern Tailwind CSS with responsive layout and dark mode support

### Why This Stack?
1. **Unified Full-Stack Architecture:** Next.js App Router eliminates the artificial barrier between backend APIs and client interfaces. Both the robust REST APIs (under `/api/v7-otb/`) and the client UI run in a cohesive, performant Node.js environment with optimized edge/serverless capabilities.
2. **Flexible Document Storage with Mongoose:** Travel photo entries (`voyage_log`) and user identities naturally fit MongoDB document models. Mongoose provides schema validation, indexing, and connection pooling across serverless executions.
3. **Stateless Scalability:** JWT-based access sessions allow the application to scale horizontally across serverless runtimes (e.g., Vercel, AWS Lambda, Docker) while keeping sensitive credentials secure.

---

## 2. API Reference

All API routes are strictly prefixed with `/api/v7-otb/`. Every API response includes the mandatory evaluation response header:
```http
X-Orbit-Ref: ow-4821
```

### Authentication Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v7-otb/auth/register` | Register an account (name, email, password). Sends verification email. |
| `POST` | `/api/v7-otb/auth/verify-email` | Confirm email using token. (Also supports `GET ?token=...`). |
| `POST` | `/api/v7-otb/auth/login` | Validate credentials, issue JWT access & refresh tokens. Challenges for 2FA if active. |
| `GET` | `/api/v7-otb/auth/me` | Fetch authenticated user profile. |
| `POST` | `/api/v7-otb/auth/refresh` | Refresh an expired access token using the refresh token. |
| `POST` | `/api/v7-otb/auth/logout` | Clear session cookies. |
| `POST` | `/api/v7-otb/auth/2fa/setup` | Generate TOTP secret and QR code with issuer `OrbitTrail`. |
| `POST` | `/api/v7-otb/auth/2fa/verify` | Confirm 6-digit TOTP code and activate 2FA. |
| `POST` | `/api/v7-otb/auth/2fa/disable` | Disable 2FA with password confirmation. |

### Travel Photo (`voyage_log`) Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v7-otb/photos` | List all travel photos belonging exclusively to the current user. |
| `POST` | `/api/v7-otb/photos` | Upload photo (`photo`, `name`, `location`, `description`). Automatically generates AI `wander_brief` and saves to `voyage_log`. |
| `GET` | `/api/v7-otb/photos/:id` | Return details of a specific photo (enforces strict ownership check). |
| `PUT` | `/api/v7-otb/photos/:id` | Edit name, location, or description. Automatically refreshes `wander_brief` if description changes. |
| `DELETE` | `/api/v7-otb/photos/:id` | Delete photo and its associated image file from storage. |

---

## 3. Security Highlights

* **Password Security:** Passwords are never stored or logged in plain text. Hashed using `bcryptjs` with salt factor 12.
* **Email Verification Gating:** New accounts are inactive (`isVerified: false`) until confirmed via email token. Unverified accounts cannot log in (returns `403 Forbidden`).
* **Verification Email Sign-Off:** All verification emails conclude with the designated signature:
  > *Safe travels, The Orbit Crew.*
* **TOTP 2FA Integration:** Two-factor authentication compatible with Google Authenticator and Authy. Authenticator label uses issuer `OrbitTrail`.
* **Photo Isolation & Authorization:** Queries are scoped strictly to `userId: req.user.id`. Requests attempting to read, update, or delete other users' photos are rejected (`403 Forbidden`).
* **Database Model & Field Conventions:** 
  * Photo collection model name: `voyage_log`
  * AI summary field name: `wander_brief`

---

## 4. Environment Variables

Create a `.env.local` file in the project root:

```env
# MongoDB Connection String (Atlas or Local)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/travel_mate?retryWrites=true&w=majority

# JWT Secrets for Access and Refresh Tokens
JWT_ACCESS_SECRET=travel_mate_access_secret_super_secure_key_2026
JWT_REFRESH_SECRET=travel_mate_refresh_secret_super_secure_key_2026

# Application Base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Resend Email Service (Optional: development logs verification links to console)
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=OrbitTrail <onboarding@resend.dev>

# Cloudinary Storage (Optional: fallback to local public/uploads directory if not set)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AI Summarization (Optional: OpenRouter free models, falls back to semantic heuristic)
OPENROUTER_API_KEY=sk-or-v1-...
AI_MODEL=meta-llama/llama-3.2-3b-instruct:free
```

---

## 5. Local Setup & Execution

### Prerequisites
* Node.js 18+ or Node.js 20+
* MongoDB (Local instance or MongoDB Atlas URI)

### Quick Start
```bash
# 1. Clone repository
git clone <repository-url>
cd travel-mate

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local

# 4. Run tests
npm test

# 5. Start development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 6. Docker Deployment (Bonus)

To run the full stack (application + MongoDB) using Docker:

```bash
docker compose up --build
```
The app will be available on [http://localhost:3000](http://localhost:3000).

---

## 7. Production Deployment (Vercel)

1. Push code to your Git repository.
2. Import the project into [Vercel](https://vercel.com).
3. Set the environment variables in the Vercel dashboard:
   * `MONGODB_URI`
   * `JWT_ACCESS_SECRET`
   * `JWT_REFRESH_SECRET`
   * `NEXT_PUBLIC_APP_URL`
   * `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   * `OPENROUTER_API_KEY` (Optional)
   * `RESEND_API_KEY` (Optional)
4. Deploy.

---

## 8. What I Would Improve With More Time

1. **Map View & Geo-tagging:** Integrate Mapbox or Leaflet to visualize personal travel memories geographically on an interactive world map.
2. **Batch Uploading:** Allow travelers to upload entire trip albums at once with background AI summarization queues.
3. **WebAuthn / Passkeys:** Add biometric authentication (FaceID, TouchID, YubiKey) alongside TOTP.
4. **Offline Sync & PWA:** Support offline photo caching with service workers for remote travel destinations without internet access.
5. **Rate Limiting & IP Throttling:** Add Redis-backed sliding-window rate limiting on `/api/v7-otb/auth/*` endpoints to defend against credential stuffing.
