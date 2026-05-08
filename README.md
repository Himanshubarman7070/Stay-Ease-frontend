# StayEase Frontend

React + Vite frontend for the StayEase Smart Tiffin & Grocery Management System.

## Tech Stack

- React 18
- React Router v6
- Axios
- Vite

## Quick Start (Local)

```bash
git clone https://github.com/Himanshubarman7070/Stay-Ease-frontend.git
cd Stay-Ease-frontend
npm install
npm run dev
```

The app will open at `http://localhost:5173` and connects to the local backend at `http://localhost:5000/api`.

> Make sure the [backend](https://github.com/Himanshubarman7070/Stay-Ease-backend) is also running locally.

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
