# smartHIVE Backend

A modular, scalable, and secure backend for the smartHIVE tenant/landlord apartment management platform.

## 🧱 Tech Stack
- Node.js + Express.js (NestJS-inspired modularity)
- TypeScript
- MongoDB + Mongoose
- Clerk (Authentication)
- Swagger (API Docs)
- Socket.IO (Real-time chat)
- Sentry (Error monitoring)
- Zod (Validation)
- Path Aliases (tsconfig-paths, module-alias)

## 📁 Folder Structure
```
src/
  app.ts
  server.ts
  config/
  common/
  utils/
  modules/
  docs/
```

## 🚀 Getting Started
1. **Install dependencies:**
   ```sh
   pnpm install
   ```
2. **Copy and configure environment variables:**
   ```sh
   cp .env.example .env
   # Edit .env with your values
   ```
3. **Run in development:**
   ```sh
   pnpm dev
   ```
4. **Build and start in production:**
   ```sh
   pnpm build
   pnpm start
   ```

## 🛠️ Features
- Modular structure per feature (apartments, units, tenants, rent, issues, chat, users)
- Clerk authentication and role-based access
- Centralized error handling and response interceptors
- Real-time chat with Socket.IO
- API docs at `/api/v1/docs`
- Sentry integration for error monitoring
- Zod for input validation
- Pagination, filtering, and file uploads

## 📚 API Documentation
- Visit [http://localhost:4000/api/v1/docs](http://localhost:4000/api/v1/docs) after running the server.

## 📝 Notes
- All routes are versioned under `/api/v1/`
- Use the provided `.env.example` to set up your environment variables
- For frontend, see the separate repo (to be implemented) 