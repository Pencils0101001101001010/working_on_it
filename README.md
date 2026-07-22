# Working On It - Full-Stack Authentication System 🔐

A secure, decoupled full-stack authentication web application built using the **MERN Stack**. It features a highly responsive **Next.js** frontend paired with a robust, flattened **Node.js/Express** backend API. This repository demonstrates standard production workflows for credentials-based authentication, user validation, and secure RESTful data routing.

Live Frontend Deployment: 🌐 [working-on-it-fmnh.vercel.app](https://vercel.app)

---

## 🏗️ Architecture Overview

The system operates using a decoupled multi-tier architecture to securely separate user interactions from private database logic.

```text
[ Client Browser ] <--- Next.js Fetch ---> [ Next.js Server Actions ]
                                                     |
                                            Secure REST API Call
                                                     v
                                          [ Node.js Backend API ]
                                                     |
                                            Database Layer (MongoDB)
```

### 1. Frontend (Next.js)
- Engineered using a modular layout to isolate client components from secure node routing.
- Handles user-friendly registration and dynamic login form states seamlessly.
- Connects modern UI interactions natively into server-side route processes.

### 2. Backend (Node.js & Express)
- Serves as the central security and authentication controller.
- Processes incoming credentials, queries records directly via MongoDB, and handles secure data serialization.
- Built to block cross-site vulnerabilities by isolating data fetching away from raw browser runtimes.

---

## 🗂️ Project Directory Structure

```text
├── client/                 # Next.js Frontend Framework Application
│   ├── src/
│   │   ├── app/            # App Router pages (Login, Register, Dashboard)
│   │   └── components/     # Reusable, user-friendly UI fields and forms
│   └── package.json
│
└── server/                 # Node.js + Express Backend Environment
    ├── controllers/        # Authentication workflow handlers (login, signup)
    ├── middleware/         # Secure route guards and request validation pipelines
    ├── models/             # MongoDB user schemas and structural blueprints
    ├── routes/             # REST API endpoints mapping
    ├── index.js            # Main backend entry point
    └── package.json
```

---

## 🛠️ Tech Stack & Dependencies

- **Frontend Core:** Next.js (App Router), TypeScript, JavaScript
- **Backend Core:** Node.js, Express Framework
- **Database Layer:** MongoDB
- **Styling:** Modern, user-friendly UI design principles

---

## ⚙️ Local Installation & Setup

To run this full-stack system locally on your terminal machine, follow these steps:

### 1. Clone the Repository
```bash
git clone https://github.com
cd working_on_it
```

### 2. Setup the Backend Server
```bash
cd server
npm install
# Configure your environment variables (.env) with your MongoDB Connection String
PORT=
MONGODB_URI=
JWT_SECRET=
NODE_ENV=
SUPABASE_ACCESS_KEY_ID=
SUPABASE_SECRET_ACCESS_KEY=
SUPABASE_ENDPOINT=
SUPABASE_REGION=
SUPABASE_BUCKET_NAME=
FRONTEND_URL=

npm run dev
```

### 3. Setup the Frontend Client
```bash
cd ../client
npm install
# Configure your environment variables indicating your local backend URL
NEXT_PUBLIC_API_BASE_URL=

npm run dev
```

---

## 🚀 Core Features & Future Scope
- [x] Secure registration interface with validation.
- [x] Decoupled Next.js client to Node.js backend credential transmission.
- [ ] Implement JWT or HTTP-Only Cookie session token tracking.
- [ ] Add Route Middleware Guards to auto-redirect unauthenticated users.

---

## 📬 Developer Contact
- **GitHub:** [@Pencils0101001101001010](https://github.com)
- **Email:** sjkinnear@gmail.com
