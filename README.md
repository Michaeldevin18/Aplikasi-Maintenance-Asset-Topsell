# Maintenance Asset Application

A mobile-first web application for managing asset maintenance, featuring barcode scanning, maintenance logging, and history tracking.

## Features

- **Authentication**: Secure login using Supabase Auth.
- **Dashboard**: Quick overview of assets and maintenance status.
- **Asset Management**: View detailed asset specifications and history.
- **Barcode Scanning**: Scan asset barcodes using the device camera.
- **Maintenance Logging**: Record preventive and corrective maintenance with photo documentation.
- **History Tracking**: View comprehensive maintenance history with filtering.
- **TAMS Integration**: Mock integration with external TAMS API.

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Lucide React, Zustand
- **Backend**: Express.js, Node.js
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Build Tool**: Vite

## Prerequisites

- Node.js (v18 or later)
- npm or pnpm
- Supabase project

## Setup

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Environment Variables**:
    Create a `.env` file in the root directory and add your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
4.  **Database Setup**:
    Run the migrations in `supabase/migrations` against your Supabase database.
    - `20260217100000_initial_schema.sql`: Sets up tables and RLS policies.
    - `20260217100100_storage_bucket.sql`: Sets up storage buckets.

## Running the Application

To run both the frontend and backend servers concurrently:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## API Endpoints

- **Auth**: handled by Supabase client
- **TAMS Mock API**: `GET /api/tams/assets/:code`
