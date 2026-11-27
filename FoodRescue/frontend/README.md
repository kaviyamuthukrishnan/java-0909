# FoodRescue – Smart Food. Shared Hope.

**Smart Food Waste Prediction and Intelligent Donation Allocation System Using Java**

Frontend application built with **React, TypeScript, Vite, React Router DOM, Tailwind CSS, Lucide Icons, and Recharts**, designed to integrate cleanly with an existing **Java Spring Boot 3 + Spring Security (JWT) + MySQL 8 (`foodrescue_db`)** backend.

---

## 1. Prerequisites & Installation

```bash
npm install
```

## 2. Environment Configuration

Copy `.env.example` to `.env` (or `.env.local`):

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_USE_MOCK_DATA=true
```

- `VITE_API_BASE_URL`: Base URL of your running Java Spring Boot REST API.
- `VITE_USE_MOCK_DATA`:
  - `true` enables **DEMO MODE** (clearly labeled in the UI) with 3 providers, 5 NGOs, historical waste records, statistical surplus predictions, multi-NGO split allocations, and interactive workflows without mutating MySQL.
  - `false` routes all authentication, provider, NGO, allocation, chat, and admin actions directly to your Spring Boot REST endpoints via `src/services/apiClient.ts`.

## 3. Starting the Frontend

```bash
npm run dev
```

For production builds:

```bash
npm run build
```

## 4. Connecting Your Java Spring Boot Backend

1. Ensure MySQL 8 is running with schema `foodrescue_db`.
2. Start your Spring Boot 3 application on `http://localhost:8080` with CORS enabled for your frontend origin.
3. Set `VITE_USE_MOCK_DATA=false` in `.env` and restart Vite.
4. All REST calls are isolated inside `src/services/`:
   - `authService.ts`: `/api/auth/login`, `/api/auth/register/provider`, `/api/auth/register/ngo`, `/api/auth/verify-email`, `/api/auth/verify-phone-otp`, `/api/auth/forgot-password`, `/api/auth/reset-password`, `/api/auth/me`
   - `providerService.ts`: `/api/providers/me`, `/api/providers/me/inventory`, `/api/providers/me/predictions/latest`, `/api/providers/me/predictions/{id}/confirm`, `/api/providers/me/donations/voluntary`
   - `ngoService.ts`: `/api/ngos/me`, `/api/ngos/donations/available`, `/api/ngos/me/allocations`, `/api/ngos/me/allocations/{id}/accept`, `/api/ngos/me/allocations/{id}/decline`, `/api/ngos/me/pickups`, `/api/ngos/me/pickups/{id}/collect`
   - `donationService.ts`: `/api/donations`, `/api/allocations/run/{donationId}`, `/api/allocations/manual`
   - `chatService.ts`: REST `/api/notifications`, `/api/chat/donations/{donationId}` + STOMP WebSocket target `/ws-foodrescue` (`/topic/donations/{donationId}`)
   - `adminService.ts`: `/api/admin/providers`, `/api/admin/ngos`, `/api/admin/users`, `/api/admin/complaints`, `/api/admin/audit-logs`

> **Security Note:** JWT Bearer tokens are held strictly in browser JS memory (`apiClient.ts`) rather than `localStorage` or `sessionStorage`. Administrator accounts cannot be self-registered publicly.

## 5. Testing All Three Portals (12-Step Demo Workflow)

1. Open `/login` (or click **Open Provider Portal** on the Home page) to sign in as **Demo Food Provider (Grand Horizon Hotel)**.
2. Go to **Food Inventory** (`/provider/inventory`) and record a daily meal batch.
3. Go to **Surplus Prediction** (`/provider/prediction`), click **Recalculate Forecast**, and respond to the **7–8 PM Surplus Confirmation Prompt** (Full, Partial, or Custom quantity).
4. Click **Run Intelligent Multi-NGO Allocation Now** to split the confirmed donation across eligible verified NGOs (e.g., 40 + 35 + 25 meals).
5. Use the **Demo Portal Switcher** in the bottom-left sidebar to switch to the **NGO Portal** (`/ngo/available`).
6. Accept an allocated batch with pickup time and transport mode, then visit **Pickup & Collections** (`/ngo/collections`) to confirm collection and community distribution.
7. Switch to the **Admin Portal** (`/admin/dashboard`, `/admin/verifications`, `/admin/monitoring`, `/admin/audit-logs`) to verify pending organizations, monitor live splits, resolve complaints, and inspect audit logs.
