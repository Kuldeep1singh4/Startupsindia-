# StartupsIndia Student Ambassador Platform

[![React](https://img.shields.io/badge/React-19.2-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-purple?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green?logo=supabase)](https://supabase.com/)

> A full-featured, responsive, gamified Student Ambassador management portal connecting student leaders across India with the StartupsIndia ecosystem.

---

## 📌 Table of Contents
- [Overview](#-overview)
- [Key Features](#-key-features)
  - [Ambassador Portal](#-ambassador-portal)
  - [Admin Management Portal](#-admin-management-portal)
  - [Public & Onboarding Pages](#-public--onboarding-pages)
- [Technology Stack](#-technology-stack)
- [Project Architecture & Directory Structure](#-project-architecture--directory-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
  - [Building for Production](#building-for-production)
- [Security & Anti-Abuse Engineering](#-security--anti-abuse-engineering)
- [Database Schema](#-database-schema)
- [License & Credits](#-license--credits)

---

## 🚀 Overview

The **StartupsIndia Student Ambassador Platform** is designed to empower student leaders across colleges and universities in India. Ambassadors complete tasks, earn points, advance through recognition tiers, claim merchandise and physical rewards, receive accredited digital certificates, and compete on city, district, state, and national leaderboards.

Platform administrators have access to an all-in-one backoffice portal to verify submissions, manage ambassador rosters, configure point levels, design certificates, and dispatch rewards.

---

## 🌟 Key Features

### 🎓 Ambassador Portal
- **Gamified Dashboard (`/dashboard`):** Real-time tier badges, points balance, progress bar to next tier, national leaderboard rank, task stats, responsive 5-card stat layout with mobile summary card, and visual milestone journey.
- **Task Library & Proof Submissions (`/tasks`):** Browse active campus tasks with points and required proof types (Screenshot, URL, File). Supports client-side compressed image uploads with instant preview, submission status badges (New, Under Review, Completed, Rejected), and centered submission modals.
- **Multi-Level Leaderboard (`/leaderboard`):** Dynamic rankings filterable by Scope (All India, State, District, City) and Timeframe (All-Time, Monthly, Quarterly), plus college-level competition tables with mobile-optimized view toggles.
- **Milestone Rewards Catalog (`/rewards`):** Visual catalog of unlocked and locked rewards (welcome kits, merchandise, conference passes) with direct claim request functionality.
- **Digital Certificates (`/certificates`):** Downloadable and shareable credential cards with verification badges and accreditation seals based on attained ambassador tiers.
- **Referral Program (`/referrals`):** Unique referral code generation, direct registration link with copy-to-clipboard toast feedback, WhatsApp and Twitter one-click social share, and tracking of referred peers.
- **Ambassador Profile (`/profile`):** Personal and academic profile overview with role designation, compressed avatar uploads, and overflow-safe referral code display.
- **Push Notification Center (`AppTopbar`):** Real-time alert notifications for announcements, urgent notices, new tasks, and reward claims with unread badge counters and one-click mark-all-as-read.

### 🛡️ Admin Management Portal (`/admin`)
- **Overview Dashboard:** High-level metrics (Active Ambassadors, Pending Applications, Approved Tasks, Pending Reviews, Total Points Issued, Avg Points) with native mobile list cards.
- **Task Verification Center:** Side-by-side submission verification queue supporting image preview, live proof URL testing, one-click approval with automatic point credit, and rejection modal with custom feedback reasons.
- **Ambassador Management:** Search and filter ambassadors across name, email, college, state, and city. Admin promotion/demotion toggles, point adjustments, and status management via centered modal.
- **Task Library Management:** Create, edit, toggle active status, and delete tasks with point values, instructions, and proof requirements.
- **Level Tier Configuration:** Configure milestone point thresholds, level badges, and designations with full-viewport modal editing.
- **Certificate Management:** Dedicated visual management interface to configure certificates, upload custom template artwork, set point criteria, and preview ambassador credential cards.
- **Reward Catalog Management:** Upload custom reward artwork, configure point requirements, inventory stock counters, and availability.
- **Push Notification Broadcasting:** Create and dispatch target-audience notifications (all ambassadors, approved only, pending applicants, or tier-specific) with custom categories and action URLs.
- **Terms & Conditions Editor:** In-app markdown editor allowing administrators to update official terms with automatic date tracking.
- **Admin Profile & Audit Logs:** Dedicated security profile separate from ambassador dashboards.

### 🌐 Public & Onboarding Pages
- **Landing Page (`/`):** Hero presentation with StartupsIndia brand assets, benefits overview, and call-to-action.
- **Ambassador Registration (`/register`):** Multi-step registration form with cascading India State → District → City selector, referral code detection via URL (`?ref=CODE`), and validation.
- **Unified Login (`/login`):** Single entry point with automated role-based routing (Ambassador ➔ `/dashboard`, Admin ➔ `/admin`).
- **Application Status Tracker (`/status`):** Status checking for applicants awaiting verification.
- **Password Recovery (`/reset-password`):** Secure token-based password reset flow with email verification.
- **Terms & Conditions (`/terms`):** Full legal terms and code of conduct.
- **Custom 404 & Error States (`/error`, NotFound):** Polished fallback pages matching the dark-mode brand theme.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool & Bundler** | [Vite 8](https://vitejs.dev/) |
| **Styling & Design System** | [TailwindCSS 4](https://tailwindcss.com/) + Custom CSS Design Tokens |
| **Routing** | [React Router 7](https://reactrouter.com/) |
| **Icons & Brand Assets** | [Lucide React](https://lucide.dev/) + Official StartupsIndia wordmark |
| **Backend & Database** | [Supabase](https://supabase.com/) (PostgreSQL, PostgREST API, Supabase Auth, Supabase Storage) |
| **Linter & Code Quality** | [Oxlint](https://oxc.rs/) |

---

## 📂 Project Architecture & Directory Structure

```text
client-dashboard/
├── .env.example               # Anonymized environment variables template
├── CHANGE_LOG.md              # Client feature roadmap and change tracking
├── SECURITY_REPORT.md         # Comprehensive security audit & stress test report
├── README.md                  # Main platform documentation
├── package.json               # Dependencies and scripts
├── vite.config.ts             # Vite configuration
│
├── public/                    # Static public assets
│   ├── startupsindia-logo.png # Official StartupsIndia logo asset
│   └── favicon.ico
│
├── scripts/
│   └── stress_test.mjs        # Automated concurrency & security test runner
│
└── src/
    ├── components/            # Reusable UI & layout components
    │   ├── AdminLayout.tsx    # Dedicated admin wrapper
    │   ├── AmbassadorLayout.tsx # Fixed desktop sidebar + mobile bottom nav
    │   ├── AmbassadorMobileNav.tsx # Native mobile bottom bar
    │   ├── AmbassadorSidebar.tsx   # Desktop navigation sidebar
    │   ├── AppTopbar.tsx      # Top bar with notifications & user menu
    │   ├── Badge.tsx          # Status, tier, and counter badges
    │   ├── Button.tsx         # Unified button styles & loading states
    │   ├── Card.tsx           # Glassmorphism container card
    │   ├── ErrorAlert.tsx     # Reusable error banner with retry callback
    │   ├── ErrorBoundary.tsx  # Global React error boundary
    │   ├── FormControls.tsx   # Custom inputs, textareas, selects
    │   ├── LoadingState.tsx   # Dual-ring glowing spinner & skeletons
    │   ├── Logo.tsx           # Official image logo component
    │   ├── Modal.tsx          # Universal createPortal centered dialog system
    │   ├── ProtectedRoute.tsx # Role-based route guards
    │   └── SectionHeader.tsx  # Page header component
    │
    ├── contexts/
    │   └── AuthContext.tsx    # Supabase session & user profile state provider
    │
    ├── lib/
    │   ├── imageCompression.ts # Client-side WebP compression & resizing engine
    │   ├── notifications.ts   # Push notification fetch & broadcast service
    │   ├── rateLimit.ts       # Sliding-window brute-force prevention engine
    │   ├── security.ts        # DevMode blocking, hotkey locks, text selection
    │   ├── supabase.ts        # Supabase client with sessionStorage auth
    │   └── utils.ts           # Class merging & formatting helpers
    │
    └── pages/                 # Route page components
        ├── ApplicationStatus.tsx
        ├── Certificates.tsx
        ├── Dashboard.tsx
        ├── ErrorPage.tsx
        ├── Landing.tsx
        ├── Leaderboard.tsx
        ├── Login.tsx
        ├── NotFound.tsx
        ├── Profile.tsx
        ├── Referrals.tsx
        ├── Registration.tsx
        ├── ResetPassword.tsx
        ├── Rewards.tsx
        ├── Tasks.tsx
        ├── Terms.tsx
        ├── Welcome.tsx
        │
        └── admin/             # Administrator sub-views
            ├── AdminDashboardView.tsx   # Overview statistics & recent apps
            ├── AdminPortal.tsx          # Single-page tabbed admin portal
            ├── AdminProfileView.tsx     # Admin personal profile
            ├── AmbassadorMgmtView.tsx   # Ambassador search, filter, roles
            ├── CertificateMgmtView.tsx  # Certificate creation & image templates
            ├── LevelMgmtView.tsx        # Point tiers & designations
            ├── NotificationMgmtView.tsx # Push notifications creator & log
            ├── RewardMgmtView.tsx       # Rewards inventory & image upload
            ├── TaskMgmtView.tsx         # Task library CRUD
            └── TaskVerificationView.tsx # Proof review & verification
```

---

## ⚡ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or later recommended)
- `npm` or `pnpm`
- A Supabase project with PostgreSQL database

### Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/Kuldeep1singh4/Startupsindia-.git
cd client-dashboard
npm install
```

### Environment Variables
Copy the template `.env.example` file to `.env`:
```bash
cp .env.example .env
```
Populate `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Running Locally
Start the development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
Navigate to `http://localhost:5173` in your browser.

### Building for Production
Type-check and generate optimized production bundle:
```bash
npm run build
```
Preview the built production bundle:
```bash
npm run preview
```

---

## 🔒 Security & Anti-Abuse Engineering

The platform implements multi-layer defense mechanisms:
1. **Strict Role Separation:** Admin and Ambassador views are strictly partitioned via `RequireAdmin` and `RequireAmbassador` guards. Admins cannot access ambassador dashboards, and ambassadors cannot access admin URLs.
2. **Session Storage Isolation:** Supabase auth is configured to use `window.sessionStorage` rather than `localStorage`, preventing session token persistence on shared or public computers.
3. **In-Memory Rate Limiting:** `src/lib/rateLimit.ts` throttles login attempts (5/min), registration (3/2min), password resets (3/5min), and task proofs (5/min).
4. **Anti-Inspection Safeguards:** Source inspection hotkeys (`F12`, `Ctrl+Shift+I`, `Ctrl+U`) and right-click context menus are suppressed.
5. **SQL Injection Defense:** All database queries utilize PostgREST parameterized statements; dynamic ID arrays are validated with strict alphanumeric UUID regular expressions.
6. **Detailed Audit Report:** Full security findings and database RLS policies are documented in [`SECURITY_REPORT.md`](file:///c:/Users/UNITECH/OneDrive/Desktop/client-dashboard/SECURITY_REPORT.md).

---

## 🪟 Universal Centered Modal Architecture

All modals, popups, and dialogs across the platform now mount exclusively through the universal [`Modal.tsx`](src/components/Modal.tsx) component:
- **`createPortal` Body Mounting:** Modals mount directly to `document.body`, completely separating dialog placement from parent layouts, sidebar widths (e.g. `w-60` desktop sidebar), topbars, or container offsets.
- **Mathematical Screen Centering:** Utilizes `fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5`, guaranteeing every new box or tab appears at the absolute dead center of the screen on all device viewports.
- **Unclipped Boundaries:** Modal dialog cards feature `max-h-[90vh] max-h-[90dvh] flex flex-col overflow-hidden` with internally scrollable bodies (`overflow-y-auto min-h-0`). Dialog cards never exceed the viewport or cut off borders.
- **Accessibility & Focus Isolation:** Includes automatic `document.body.style.overflow = "hidden"` scroll-locking when open, physical `Escape` key listeners, and backdrop click-to-dismiss.
- **Unified Header & Icon Design:** Supports icons, title, subtitle/description, and optional close buttons in a cohesive design system.

---

## 📱 Phone & Tablet Viewport Hardening (Zero Overflows)

Every page and view has been audited and hardened for mobile (320px–480px), tablet (640px–1024px), and desktop viewports:
- **Elimination of Accidental Containing Blocks:** Updated CSS micro-animations (`@keyframes fade-in` in `src/index.css`) to strictly animate `opacity` without `transform: translateY(...)`. Per CSS specifications, non-`none` transforms cause elements to become containing blocks for `position: fixed` descendants, which previously displaced fixed overlays.
- **Dynamic 5-Card Stats Grid:** On `/dashboard`, the 5-stat card layout adapts seamlessly via `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5`, with the 5th card automatically spanning 2 columns on mobile for a clean summary card without awkward orphaned half-boxes.
- **Responsive Navigation & Action Buttons:**
  - Leaderboard view toggles (`Ambassadors` vs `Colleges`) adapt via `flex-wrap sm:flex-nowrap` with `flex-1 sm:flex-none`.
  - Task submission buttons on `/tasks` switch to full-width block buttons (`w-full sm:w-auto`) on mobile for effortless touch targeting.
  - Verification actions in admin views use dual 50% split buttons on mobile and clean column stacking on tablets/desktops.
- **Safe Truncation & Word Wrapping:** Long email addresses, university names, and referral URLs enforce `break-all` and flex `min-w-0` to prevent horizontal viewport blowout on small phones.
- **Isolated Layout Scrolling:** Desktop menu/sidebar and top navigation header remain static; only the inner main content area scrolls (`data-scroll-container`), preserving scroll positions during navigation.

---

## 🗜️ Storage Optimization & Client-Side Compression Engine

The platform implements high-performance client-side image compression (`src/lib/imageCompression.ts`) before any media reaches Supabase Storage:
- **WebP Modern Format Conversion:** Automatically transforms PNG, JPG, and standard formats into modern WebP with automatic fallback.
- **Resolution & Dimension Capping:**
  - Standard card artwork, task proofs, reward assets, and certificate templates: Max dimension capped at 1920px.
  - Ambassador profile avatars and tier badges: Max dimension capped at 800px.
- **Strict Size Thresholds:** Compresses source images down to ≤ 300–500KB (≤ 100KB for avatars/badges), saving over 80–90% bandwidth and storage consumption.
- **Direct Upload Integration:** Applied at every upload entry point across the application:
  - Ambassador Profile photo upload
  - Task proof submission (Screenshot/Image)
  - Admin Reward Catalog artwork creation
  - Admin Certificate Template artwork creation
  - Admin Level Tier custom badge/medal upload

---

The platform relies on the following key Supabase tables:
- `ambassadors`: Ambassador profile records, university details, points balance, referral code, and role (`ambassador` or `admin`).
- `tasks`: Task catalog with titles, descriptions, points, proof requirements, and active toggles.
- `task_submissions`: Proof submissions linked to `ambassador_id` and `task_id` with statuses (`Pending`, `Approved`, `Rejected`) and rejection reasons.
- `rewards`: Merchandise catalog with required points, level constraints, stock counters, and image URLs.
- `reward_claims`: Ambassador claim requests with fulfillment statuses.
- `levels_config`: Level thresholds (`Bronze`, `Silver`, `Gold`, `Platinum`, `Diamond`, `National`).
- `admin_logs`: Audit trail recording role updates and administrative actions.

---

## 📄 License & Credits

Developed for **StartupsIndia** by the Antigravity Engineering Team. All rights reserved.