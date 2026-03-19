# PropManage Pro - Property Management Application

A modern, high-performance property management application built with **React**, **Vite**, and **Tailwind CSS**.

## Features

- **Manager Dashboard**: Overview of revenue, occupancy, and active maintenance tasks.
- **Lease Management**: Create, edit, and track tenant leases and rental agreements.
- **Utility Sharing**: Allocate utility bills (electricity, water, etc.) to tenants based on occupancy periods or equal split.
- **Maintenance Tracking**: Schedule and monitor property maintenance requests.
- **Tenant Messaging**: Direct communication with tenants with WhatsApp integration for notifications.
- **Tenant Portal**: Personal dashboard for tenants to view rent dues, utility shares, and lease details.

## Tech Stack

- **Frontend**: React 19, Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/property-management.git
   cd property-management
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`.

## Deployment

The application is optimized for static hosting platforms like **Vercel**, **Netlify**, or **GitHub Pages**.

To build for production:
```bash
npm run build
```

## Persistence Setup (Google Sheets API)

To save and persist data for this application, follow these steps:

### 1. Create a Google Sheet
Create a new Google Sheet and add the following tabs (with matching headers):
- **Units**: `id`, `unitNumber`, `size`, `expectedRent`, `status`, `fittings`, `propertyName`
- **Tenants**: `id`, `name`, `unit`, `email`, `mobile`, `password`, `baseRent`, `deposit`, `leaseStart`, `leaseEnd`, `propertyName`
- **Bills**: `id`, `type`, `date`, `amount`, `mode`, `allocations`, `propertyName`
- **Tasks**: `id`, `title`, `tenantId`, `status`, `dateOptions`, `propertyName`
- **Messages**: `id`, `tenantId`, `content`, `timestamp`, `photoUrl`, `propertyName`
- **Properties**: `id`, `name`, `address`

### 2. Deploy Google Apps Script
1. Open your Sheet and go to **Extensions > Apps Script**.
2. Copy the contents of [`backend/gas_script.gs`](./backend/gas_script.gs) into the editor.
3. Click **Deploy > New Deployment**.
4. Select **Web App** as the type.
5. Set **Execute as**: `Me` and **Who has access**: `Anyone`.
6. Click **Deploy** and copy your **Web App URL**.
7. **CRITICAL**: Go to **Project Settings** (gear icon) in the Apps Script editor and ensure the **Time zone** is set to `(GMT+08:00) Kuala Lumpur` (or your local GMT+8 region) to ensure date consistency.

### 3. Configure Environment Variables
1. Paste your Web App URL into your local `.env` file as `VITE_API_URL`.
2. Restart your development server.

## Environment Variables

Copy the example file and fill in your variables:
```bash
cp .env.example .env
```

## License

MIT
