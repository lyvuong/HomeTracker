# 🏠 HomeTracker — Home Maintenance & Repair Log PWA

[![React](https://img.shields.io/badge/React-19-emerald?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-purple?style=flat-square&logo=vite)](https://vitejs.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%26%20Auth-orange?style=flat-square&logo=firebase)](https://firebase.google.com)

**HomeTracker** is a modern, offline-capable Progressive Web Application (PWA) for tracking home maintenance, repairs, and expenses across one or more properties. It features real-time cloud sync powered by **Google Firebase**, multi-user audit badges, and a **Shared Household** feature that lets families manage the same set of homes together in real time.

HomeTracker is a **companion app to [CarTracker](../CarTracker)** — it intentionally reuses the exact same household model and `transactions` ledger collection, so a family's car costs and home costs live side by side under one Household Code.

---

## ✨ Features

- 🏠 **Home Portfolio Management**: Keep detailed profiles for every property — nickname, address, property type, year built, square footage, purchase date, and notes.
- 📋 **Comprehensive Home Expense & Maintenance Logs**: Record maintenance, repairs, and homeownership expenses — HVAC, Plumbing, Electrical, Roofing, Appliances, Landscaping, Property Tax, Mortgage, Homeowners Insurance, HOA Fees, Home Warranty, and more — with dates, itemized costs, payment types, providers/contractors, and notes.
- 🧾 **Tax Deductible Tracking**: Flag any log entry (e.g. Property Tax payments) as a tax-deductible expense; the flag auto-enables when the Property Tax category is selected.
- ⏰ **Smart Maintenance Reminders**: Date-based and repeat-interval reminders so seasonal tasks (gutter cleaning, filter changes) never slip through the cracks.
- 📊 **Interactive Financial Analytics**: Cost summaries per home, total lifetime expenses, and monthly cost breakdowns by category and type.
- 👨‍👩‍👧‍👦 **Shared Household Sync**: Real-time cross-device sync via a shared **Household Code** — the same code used in CarTracker joins the same household.
- 👤 **Multi-User Audit Badges**: Every home card and maintenance log is tagged with audit metadata (`👤 Logged by [User]`, `✏️ Edited by [User]`).
- 🔐 **Secure Google OAuth Gate**: Mandatory login screen with account picker.
- 💾 **Offline-First & Data Portability**: Works offline with LocalStorage caching. Backup and restore your complete dataset via JSON export/import, or export maintenance history as CSV.
- ⚙️ **Protected Advanced Settings**: Firebase credentials and demo dataset controls are tucked away in a lockable Advanced Setup section.

---

## 🚀 Quick Start & Local Development

### Prerequisites
- **Node.js**: v20.0.0 or higher
- **npm** or **yarn**

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3001`.

3. **Build for production**:
   ```bash
   npm run build
   ```

> **Note**: The service worker (`public/sw.js`) only registers in production builds (`import.meta.env.PROD`). It's intentionally skipped in `npm run dev`.

---

## 🔥 Firebase Setup — Shared Backend with CarTracker

HomeTracker is configured to use the **same Firebase project as CarTracker** by design, so both apps' household codes, homes/vehicles, and cost ledgers live together. If you're setting this up fresh (not sharing an existing project), follow CarTracker's `README.md` Firebase setup steps (Authentication, Firestore, Realtime Database, security rules) — the same Firestore rules already generically cover any subcollection under a household:

```javascript
match /households/{householdCode}/{subcollection}/{document=**} {
  allow read, write: if isHouseholdMember(householdCode);
}
```

That means HomeTracker's `houses`, `homeRecords`, `homeReminders`, and shared `transactions` subcollections work with **no rule changes** once CarTracker's rules are deployed.

### Connecting Credentials

Create a `.env` file in the project root (gitignored) with the same values as CarTracker's `.env`:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

See `.env.example` for the expected shape.

---

## ⚡ Deploying to Cloudflare Pages

Same process as CarTracker:

```bash
npm run build
npx wrangler pages deploy dist --project-name=hometracker
```

Or connect the repo via **Workers & Pages > Create > Pages > Connect to Git** with build command `npm run build` and output directory `dist`. Remember to add this deployment's domain to **Firebase Console > Authentication > Settings > Authorized Domains**.

`public/_redirects` must stay empty/comment-only on Cloudflare Pages (SPA routing is handled by `wrangler.toml`'s `not_found_handling = "single-page-application"` instead).

---

## 👨‍👩‍👧‍👦 How Shared Household Sync Works

1. Open **Settings** > **Shared Household Sync**.
2. Enter the same Household Code you use in CarTracker (e.g. `VUONG-FAMILY`) and click **Save & Join Household**.
3. All homes, maintenance logs, and reminders created by any family member sync across devices in real time, and combine with car expenses in the shared cost ledger.

---

## 🧾 Shared `transactions` Ledger (With CarTracker)

Every maintenance log is split across two linked Firestore documents that share the same ID, mirroring CarTracker's pattern:

- **`homeRecords/{id}`** — HomeTracker-specific fields: `homeId`, `category`, `type`, `nextServiceDate`, plus audit metadata.
- **`transactions/{id}`** — the exact same generic ledger collection CarTracker writes to (`users/{uid}/transactions` or `households/{code}/transactions`):

  | Field | Type | Notes |
  |---|---|---|
  | `date` | `string` (`YYYY-MM-DD`) | Service date |
  | `time` | `string` (`HH:MM`) | Time the entry was logged |
  | `amount` | `number` | Cost |
  | `vendor` | `string` | Contractor / service provider name |
  | `notes` | `string?` | Free text |
  | `category` | `string` | Free-form; HomeTracker auto-fills `"Home - {MaintenanceCategory} - {home.nickname}"` |
  | `paymentType` | `'Cash' \| 'Credit Card' \| 'Debit Card' \| 'Bank Transfer' \| 'Check' \| 'Other'` | |
  | `user` | `string` | Display name of whoever logged it |
  | `isTaxDeductible` | `boolean?` | Marks the expense as tax-deductible (auto-set for Property Tax) |

CarTracker's vehicle service records (in `records`) and HomeTracker's maintenance records (in `homeRecords`) both join against the same `transactions` collection by shared document ID — so a household's Cost Analytics in either app is reading from one combined ledger without any schema changes.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS 4, Lucide Icons, Recharts
- **Build Tool**: Vite 8
- **Backend & Auth**: Google Firebase (Authentication, Firestore, Realtime Database) — shared project with CarTracker
- **Deployment**: Cloudflare Pages

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
