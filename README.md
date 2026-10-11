# Fastor CRM Lead Management REST API

A production-ready Customer Relationship Management (CRM) backend built with **Node.js**, **Express**, **MongoDB (Mongoose)**, and **JWT Authentication**.

Developed by **Sarthak Singh Tomar** for the Fastor Full Stack Developer Technical Assessment.

---

## 📌 Business Logic Overview

1. **Employee / Counselor Accounts**: Each employee/counselor of the company is registered with their unique email address and credentials.
2. **Public Enquiry Form (Unauthenticated)**: Prospective clients fill out their basic details (Name, Email, Phone, Course Interest, Notes). This public endpoint allows lead capturing from website landing pages or counselor phone calls.
3. **Public / Unclaimed Feed**: Inside the CRM, all employees/counselors can view open/unclaimed enquiries.
4. **Claiming Leads**: An employee can "Claim" any unclaimed lead. Claiming assigns the lead exclusively to that counselor, transitions its state to `claimed`, and removes it from the public feed.
5. **Private Leads Feed**: Counselors can view the list of leads claimed specifically by them.

---

## 🛠️ Tech Stack & Architecture

- **Runtime**: Node.js (v20+ / ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Token (JWT) + bcryptjs password hashing
- **Security & Logging**: CORS, Morgan HTTP logger, centralized error handler

### Directory Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic
│   ├── controllers/
│   │   ├── authController.js     # Employee register, login, profile
│   │   └── enquiryController.js  # Lead submission, unclaimed, claim, claimed
│   ├── middleware/
│   │   ├── auth.js               # JWT verification & req.user injection
│   │   └── errorHandler.js       # Centralized 404 & error handlers
│   ├── models/
│   │   ├── User.js               # Employee/Counselor schema
│   │   └── Enquiry.js            # Lead/Enquiry schema with status & claimedBy
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth routes
│   │   └── enquiryRoutes.js      # /api/enquiries routes
│   ├── utils/
│   │   └── generateToken.js      # JWT token generator
│   ├── app.js                    # Express application configuration
│   ├── server.js                 # HTTP server entry point
│   └── seed.js                   # Database seed script for quick testing
├── .env.example                  # Environment configuration template
├── package.json
├── postman_collection.json       # Ready-to-import Postman collection
└── README.md
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update `.env` with your MongoDB connection string and JWT secret:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/crm_db?retryWrites=true&w=majority
JWT_SECRET=fastor_crm_super_secure_jwt_secret_key_2026
JWT_EXPIRES_IN=7d
```

### 3. Seed Sample Data (Optional but recommended)
Populates demo counselor account (`counselor@fastor.ai` / `Password123`) and 4 sample unclaimed leads:
```bash
npm run seed
```

### 4. Run the Server
```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm start
```

Server starts at: `http://localhost:5000`

---

## 📡 REST API Reference

### 1. Authentication Endpoints

#### Register Employee
- **Route**: `POST /api/auth/register`
- **Access**: Public
- **Request Body**:
```json
{
  "name": "Sarthak Singh Tomar",
  "email": "counselor@fastor.ai",
  "password": "Password123",
  "role": "counselor"
}
```
- **Response** (201 Created):
```json
{
  "success": true,
  "message": "Employee registered successfully",
  "data": {
    "_id": "6527...",
    "name": "Sarthak Singh Tomar",
    "email": "counselor@fastor.ai",
    "role": "counselor",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login Employee
- **Route**: `POST /api/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "counselor@fastor.ai",
  "password": "Password123"
}
```
- **Response** (200 OK): Returns JWT token in `data.token`.

#### Get Logged-in Profile
- **Route**: `GET /api/auth/me`
- **Access**: Private (`Authorization: Bearer <token>`)

---

### 2. Public Enquiry Form (Lead Capture)

#### Submit Enquiry
- **Route**: `POST /api/enquiries/public` (or `POST /api/enquiries`)
- **Access**: **Public (No Authentication required)**
- **Request Body**:
```json
{
  "name": "Aarav Mehta",
  "email": "aarav.mehta@example.com",
  "phone": "+91 9898765432",
  "courseInterest": "Full Stack Web Development",
  "notes": "Looking for weekend batch with placement assistance",
  "source": "online_form"
}
```
- **Response** (201 Created):
```json
{
  "success": true,
  "message": "Enquiry submitted successfully! A counselor will reach out shortly.",
  "data": {
    "_id": "6708b...",
    "name": "Aarav Mehta",
    "email": "aarav.mehta@example.com",
    "phone": "+91 9898765432",
    "courseInterest": "Full Stack Web Development",
    "status": "unclaimed",
    "claimedBy": null,
    "claimedAt": null,
    "createdAt": "2026-10-11T08:30:00.000Z"
  }
}
```

---

### 3. CRM Lead Management (Counselor Endpoints)

#### Fetch All Unclaimed Leads
- **Route**: `GET /api/enquiries/unclaimed`
- **Access**: Private (`Authorization: Bearer <token>`)
- **Response** (200 OK): Returns all enquiries where `status: "unclaimed"`.

#### Claim Lead
- **Route**: `PATCH /api/enquiries/:id/claim` (also supports `POST`)
- **Access**: Private (`Authorization: Bearer <token>`)
- **Logic**:
  - Atomically assigns lead to logged-in counselor.
  - Updates `status` to `"claimed"`.
  - Sets `claimedAt` timestamp.
  - Prevents race conditions (if already claimed, returns `409 Conflict`).
- **Response** (200 OK):
```json
{
  "success": true,
  "message": "Enquiry claimed successfully. It is now private and assigned to you.",
  "data": {
    "_id": "6708b...",
    "name": "Aarav Mehta",
    "status": "claimed",
    "claimedBy": {
      "_id": "6527...",
      "name": "Sarthak Singh Tomar",
      "email": "counselor@fastor.ai"
    },
    "claimedAt": "2026-10-11T08:35:00.000Z"
  }
}
```

#### Fetch My Claimed Leads
- **Route**: `GET /api/enquiries/claimed` (or `GET /api/enquiries/my-claimed`)
- **Access**: Private (`Authorization: Bearer <token>`)
- **Response** (200 OK): Returns only leads claimed by the logged-in counselor.

#### Get Single Lead Details
- **Route**: `GET /api/enquiries/:id`
- **Access**: Private (`Authorization: Bearer <token>`)
- **Privacy Rule**: Returns lead details if unclaimed or if claimed by the requesting counselor (or admin). Returns `403 Forbidden` if claimed by another counselor.

---

## ✅ Acceptance Criteria Checklist

| Requirement | Implementation | Status |
| :--- | :--- | :---: |
| Database must be postgres/Mysql/Mongodb | MongoDB + Mongoose ODM | ✅ Complete |
| Express Framework used | Express 5.x with modular routing | ✅ Complete |
| JWT token authentication | `jsonwebtoken` Bearer auth middleware | ✅ Complete |
| API for Employee login / register | `POST /api/auth/register`, `POST /api/auth/login` | ✅ Complete |
| Public form API accessible without auth | `POST /api/enquiries/public` | ✅ Complete |
| API to claim leads | `PATCH /api/enquiries/:id/claim` (Atomic update) | ✅ Complete |
| API to fetch unclaimed leads | `GET /api/enquiries/unclaimed` | ✅ Complete |
| API to fetch leads claimed by logged in user | `GET /api/enquiries/claimed` | ✅ Complete |

---

## 🧪 Postman Collection Import
A complete Postman collection is included in this repository:
[`postman_collection.json`](./postman_collection.json)

1. Open Postman $\rightarrow$ Click **Import**.
2. Select `postman_collection.json`.
3. Running `Register` or `Login` automatically saves `authToken` to collection variables!
