# MDO - MyDay, all in One

A modern, high-performance property management application built with **React**, **Vite**, and **Framer Motion**. Optimized for real-time tracking, financial auditing, and tenant communication.

## 🚀 Key Features

### 🏢 Strategic Asset Management
- **Centralized Property Catalog**: Manage multiple buildings and units from a single command center.
- **Unit Performance Tracking**: Real-time vacancy analysis, yield calculation, and vacancy duration tracking.
- **Inventory & Fittings Management**: Digital inventory logs for every individual unit (Aircon, Fridge, etc.).

### 💰 Financial Intelligence & Ledger
- **Rent Collection Automation**: Track upcoming dues, identify urgent collections, and send automated WhatsApp reminders.
- **Verification Workflow**: One-click payment verification that automatically archives payment proofs.
- **Historical Payment Ledger**: Full auditable transaction history of all past rent collections.
- **PDF Financial Reports**: Generate professional, branded collection statements with one click (via jsPDF).
- **Utility Share Engine**: Intelligent allocation of building bills (Water/Electricity) to tenants based on residency periods.

### 💬 Unified Communication Center
- **Tenant Inbox**: View incoming messages with photo attachments (rent proofs, maintenance issues).
- **WhatsApp Deep-Integration**: Direct reply capability that pre-fills context-aware messages for instant communication.
- **Task Dispatch**: Convert tenant issues into maintenance tasks and dispatch vendors via WhatsApp.

### 🛠️ Service Network & Maintenance
- **Vendor Directory**: Manage a verified network of contractors (Plumbing, Electrical, etc.) with rating systems.
- **Advanced Maintenance Tracking**: Milestone-based tracking for repairs and property upgrades.

## 🛠️ Tech Stack

- **Frontend**: React 19 (Hooks & Memoization for performance)
- **Animations**: Framer Motion (State-aware transitions)
- **Icons**: Lucide React
- **PDF Engine**: jsPDF & AutoTable (Client-side generation)
- **Backend Data**: Google Sheets API (via Google Apps Script)

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- Google Account (for database)

### Installation
1. Clone the repository: `git clone <repo-url>`
2. Install dependencies: `npm install`
3. Run Development: `npm run dev`

## ☁️ Database Setup (Google Sheets)

The application uses Google Sheets as a lightweight, real-time database.

### 1. Spreadsheet Structure
Create a Google Sheet with the following **exact** tabs and headers (ALL-CAPS Recommended):

- **UNITS**: `ID`, `UNITNUMBER`, `SIZE`, `EXPECTEDRENT`, `STATUS`, `FITTINGS`, `PROPERTYNAME`
- **TENANTS**: `ID`, `NAME`, `UNIT`, `MOBILE`, `PASSWORD`, `BASERENT`, `DEPOSIT`, `LEASESTART`, `LEASEEND`, `PROPERTYNAME`, `LASTPAYMENTDATE`, `LEASEDOCUMENT`
- **PAYMENTS**: `ID`, `TENANTID`, `AMOUNT`, `DATE`, `PROPERTYNAME`
- **BILLS**: `ID`, `TYPE`, `DATE`, `AMOUNT`, `MODE`, `ALLOCATIONS`, `PROPERTYNAME`
- **TASKS**: `ID`, `TITLE`, `TENANTID`, `STATUS`, `DATEOPTIONS`, `PROPERTYNAME`
- **MESSAGES**: `ID`, `TENANTID`, `CONTENT`, `TIMESTAMP`, `PHOTOURL`, `PROPERTYNAME`
- **VENDORS**: `ID`, `NAME`, `MOBILE`, `TYPE`, `RATING`, `EMAIL`, `PROPERTYNAME`
- **PROPERTIES**: `ID`, `NAME`, `ADDRESS`, `CURRENCY`
- **MANAGERS**: `ID`, `NAME`, `MOBILE`, `PASSWORD`

### 2. Backend API Deployment
1. Go to **Extensions > Apps Script** in your Google Sheet.
2. Paste the code from [`backend/gas_script.gs`](./backend/gas_script.gs).
3. **Crucial**: Set the Script Timezone to your local region (e.g., GMT+8) in Project Settings.
4. Click **Deploy > New Deployment > Web App**.
5. Set 'Who has access' to **Anyone**.
6. Copy the **Web App URL** and add it to your `.env` file as `VITE_API_URL`.

## 📈 Deployment
The project is configured for one-click deployment to **Vercel** or **Netlify**. Ensure environment variables are set in your hosting provider's dashboard.

## 📝 License
MIT
