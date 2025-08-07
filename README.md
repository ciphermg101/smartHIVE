# smartHIVE

A modern, modular, and scalable apartment management platform for landlords, property managers, and tenants. smartHIVE streamlines property operations, tenant communication, financial tracking, and maintenance, all in one AI-powered platform.

---

## 🚀 Features
- **Property Management:** Manage multiple properties and units from a single dashboard.
- **Tenant Portal:** Tenants can pay rent, submit maintenance requests, and communicate with management.
- **Financial Tracking:** Track income, expenses, and generate financial reports.
- **Maintenance Tracking:** Streamline maintenance requests and vendor management.
- **Analytics & Reports:** Advanced analytics for property performance.
- **AI Automation:** Automate repetitive tasks and gain predictive insights.
- **Role-based Access:** Owners, caretakers, and tenants have different permissions.
- **Real-time Chat:** Built-in chat for instant communication.
- **Authentication:** Secure sign-up/sign-in with Clerk.
- **Responsive UI:** Built with React, TailwindCSS, and modern UI/UX best practices.

---
## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite, TailwindCSS, Clerk, Zustand, React Query, Socket.IO
- **Backend:** Node.js, Express.js, TypeScript, MongoDB (Mongoose), Clerk, Swagger, Socket.IO, Sentry, Zod
- **DevOps:** Vercel (frontend), environment-based configuration, modular codebase

---
## 📁 Repository Structure

```
/client   # Frontend React app
/backend  # Backend Node.js/Express API
```

---
## 🌐 Frontend (client)

- **Pages:** Landing, Onboarding, Dashboard, Apartments, SignIn, SignUp, Unauthorized, UserProfile
- **Features:** Modular sections for Overview, Manage Apartment, Tenants, Units, Payments, Issues
- **State Management:** Zustand for global state (user, apartment)
- **API Communication:** Axios, React Query for data fetching and caching
- **Authentication:** Clerk integration for secure user management
- **UI:** TailwindCSS, custom components, dark/light theme support

### Main User Flows

- **Landing:** Marketing and feature overview, call-to-action for sign-up.
- **Sign Up/Sign In:** Clerk-powered authentication.
- **Onboarding:** Register/select apartments, upload images, and set up property.
- **Dashboard:** Main hub for managing apartments, units, tenants, payments, and issues.
- **Role-based Views:** Owners can manage apartments and invite users; tenants have access to their own units and can report issues.

---

## 🖥️ Backend (backend)

- **API:** RESTful endpoints for apartments, units, users, payments, issues, chat.
- **Authentication:** Clerk middleware for secure, role-based access.
- **Database:** MongoDB with Mongoose models for all entities.
- **Real-time:** Socket.IO for chat and notifications.
- **Validation:** Zod for input validation.
- **Docs:** Swagger UI at `/api/v1/docs`.
- **Error Handling:** Centralized error handler and Sentry integration.

### Main Modules

- **Apartments:** CRUD, invite users, manage tenants.
- **Units:** CRUD, assign tenants, manage status.
- **Users:** Profile management, Clerk sync.
- **Payments:** Simulate and track rent payments.
- **Issues:** Report and manage maintenance issues.
- **Chat:** Real-time messaging with Clerk-authenticated sockets.

---
## ⚡ Getting Started
### Backend
```bash
cd backend
pnpm install
cp .env.example .env # Edit with your values
pnpm dev             # For development
# or
pnpm build && pnpm start # For production
```
- API docs: [https://smarthive-q699.onrender.com/api/v1/docs](https://smarthive-q699.onrender.com/api/v1/docs)

### Frontend

```bash
cd client
pnpm install
pnpm dev
```
- App runs on [https://smart-hive-three.vercel.app](https://smart-hive-three.vercel.app) (default Vite port)
---

## ⚙️ Environment Variables

- Backend: See `.env.example` for required variables (MongoDB URI, Clerk keys, etc.)
- Frontend: Requires `VITE_API_BASE_URL`, `VITE_CLERK_PUBLISHABLE_KEY`, and Cloudinary config for image uploads.

---
## 🚀 Deployment
- Frontend: Deployable on Vercel (see `vercel.json`).
- Backend: Deployable on any Node.js server with MongoDB access.
---
## 📄 License
ISC
---

---
## 📄 Demo and Pitch Deck

- Pitch Deck: https://gamma.app/docs/smartHIVE-The-Future-of-Property-Management-vncohcoedfn98vv
- Demo Video: https://gamma.app/docs/smartHIVE-The-Future-of-Property-Management-vncohcoedfn98vv

---

**smartHIVE** — The future of apartment management.