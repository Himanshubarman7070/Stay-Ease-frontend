# StayEase Frontend

React + Vite frontend for the StayEase Smart Tiffin & Grocery Management System.

## Tech Stack

- React 18
- React Router v6
- Axios
- Vite

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- The [StayEase Backend](https://github.com/Himanshubarman7070/Stay-Ease-backend) running locally

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/Himanshubarman7070/Stay-Ease-frontend.git
cd Stay-Ease-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and set the backend URL:

```env
VITE_API_URL=http://localhost:5000/api
```

> If your backend runs on a different port, update this value accordingly.

### 4. Start the dev server

```bash
npm run dev
```

The app will open at `http://localhost:5173`.

## Build for Production

```bash
npm run build
```

The static files will be in the `dist/` folder.

## Project Structure

```
src/
  components/     # Shared UI components (Navbar, Sidebar, etc.)
  context/        # React context (Auth, Cart, Toast)
  pages/
    admin/        # Admin panel pages
    customer/     # Customer portal pages
  routes/         # App route definitions
  services/       # Axios API service layer
  styles/         # Global CSS
  utils/          # Utility helpers
```
