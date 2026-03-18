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

## Environment Variables

Copy the example file and fill in your variables:
```bash
cp .env.example .env
```

## License

MIT
