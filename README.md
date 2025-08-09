# smartHIVE

## 🌐 Live Demo
### **Frontend:** [https://smart-hive-three.vercel.app](https://smart-hive-three.vercel.app)  
### **Backend API Docs:** [https://smarthive-q699.onrender.com/api/v1/docs](https://smarthive-q699.onrender.com/api/v1/docs)

---

## 🧪 Test Credentials
```
email: christofmbuthiamg2018@gmail.com
pass: 78nLzg#R+R#5L4x
```

---

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

---

## 🖥️ Backend (backend)
- **API:** RESTful endpoints for apartments, units, users, payments, issues, chat
- **Authentication:** Clerk middleware for secure, role-based access
- **Database:** MongoDB with Mongoose models for all entities
- **Real-time:** Socket.IO for chat and notifications
- **Validation:** Zod for input validation
- **Docs:** Swagger UI at `/api/v1/docs`
- **Error Handling:** Centralized error handler and Sentry integration

---

## ⚡ Getting Started
### Backend
```bash
cd backend
pnpm install
cp .env.example .env # Edit with your values
pnpm dev             # Development
pnpm build && pnpm start # Production
```

### Frontend
```bash
cd client
pnpm install
pnpm dev
```

---

## ⚙️ Environment Variables
- **Backend:** See `.env.example` for required variables (MongoDB URI, Clerk keys, etc.)
- **Frontend:** Requires `VITE_API_BASE_URL`, `VITE_CLERK_PUBLISHABLE_KEY`, and Cloudinary config for image uploads.

---

## 🚀 Deployment
- **Frontend:** Deployable on Vercel (see `vercel.json`)
- **Backend:** Deployable on any Node.js server with MongoDB access

---

## 📄 License
ISC

---

## 📄 Demo and Pitch Deck
- **Pitch Deck:** [https://gamma.app/docs/smartHIVE-The-Future-of-Property-Management-vncohcoedfn98vv](https://gamma.app/docs/smartHIVE-The-Future-of-Property-Management-vncohcoedfn98vv)

---

# 📸 Screenshots

---
![Landing Page](./client/src/assets/Readme%20Images/landing-page.png)  
> **Landing Page** - First impression of smartHIVE with key features and call-to-action

---
![Sign Up Page](./client/src/assets/Readme%20Images/sign-up-page.png)  
> **Sign Up** - Create your account to get started

---
![Login Page](./client/src/assets/Readme%20Images/login-page.png)  
> **Login** - Secure access to your smartHIVE account

---
![Onboarding Page](./client/src/assets/Readme%20Images/onboarding-page.png)  
> **Onboarding** - Set up your property and preferences

---
![Dashboard Light Mode](./client/src/assets/Readme%20Images/dashboard-light-mode.png)  
> **Dashboard Overview** - Get a quick snapshot of your properties

---
![Dashboard Collapsed Sidepane](./client/src/assets/Readme%20Images/dashboard-collapsed-sidepane.png)  
> **Collapsed Navigation** - More screen space for your content

---
![Dashboard Open Pane](./client/src/assets/Readme%20Images/dashboard-open-pane.png)  
> **Expanded Navigation** - Quick access to all features

---
![Manage Apartment Page](./client/src/assets/Readme%20Images/manage-apartment-page.png)  
> **Apartment Management** - View and manage your properties

---
![Edit Apartment Modal](./client/src/assets/Readme%20Images/edit-aparment-modal.png)  
> **Edit Property** - Update property details with ease

---
![Units Page](./client/src/assets/Readme%20Images/units-page.png)  
> **Unit Management** - Manage individual units and their details

---
![Manage Tenants Tab](./client/src/assets/Readme%20Images/manage-tenants-tab.png)  
> **Tenant Management** - Keep track of all your tenants in one place

---
![Chat Page](./client/src/assets/Readme%20Images/chat-page.png)  
> **Real-time Chat** - Communicate instantly with tenants and team members
