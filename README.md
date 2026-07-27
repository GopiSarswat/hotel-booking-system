# Stayora — Hotel Booking System

A full-stack MERN hotel booking platform with inventory-aware availability, role-based access, verified-stay reviews, search filters, and admin analytics. The interface uses a dark, minimal SaaS-inspired visual language adapted for travel.

## Highlights

- JWT access tokens plus rotating refresh-token cookies
- Guest, user, and admin route guards
- Hotel search by city, dates, guests, price, amenities, and rating
- Room-type inventory with correct half-open date overlap checks
- Booking, mock payment confirmation, cancellation, and user dashboard
- Reviews restricted to completed stays
- Hotel/room management, all-booking view, and aggregation-driven analytics
- Responsive React UI with subtle Framer Motion transitions

## Local setup

Prerequisites: Node.js 20+ and MongoDB 7+ (local or Atlas).

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
npm run install:all
npm install
npm run seed --prefix server
npm run dev
```

The client runs at `http://localhost:5173` and API at `http://localhost:5000/api`.

Demo accounts after seeding:

- Admin: `admin@stayora.com` / `Password123!`
- User: `demo@stayora.com` / `Password123!`

## Availability rule

Each room record represents a room type with multiple `totalUnits`. A booking overlaps when:

```text
existing.checkIn < requestedCheckOut
AND existing.checkOut > requestedCheckIn
```

Cancelled bookings are ignored. A booking succeeds only while overlapping bookings are fewer than `totalUnits`. Adjacent stays (one checks out the day another checks in) do not conflict. The final check and insert run under a per-room application lock, preventing last-room races within this single-server deployment. A MongoDB transaction or inventory ledger would be the next step for a horizontally scaled deployment.

Run the focused cases with:

```bash
npm test --prefix server
```

## API

The requested endpoints live under `/api`: auth (`/auth`), hotels and reviews (`/hotels`), rooms (`/rooms`), bookings (`/bookings`), and analytics (`/admin/stats`). Admin create/update hotel routes accept JSON image URLs or multipart uploads stored under `server/uploads` in development.

## Project structure

```text
server/src/
  config/ controllers/ middleware/ models/ routes/ utils/
client/src/
  api/ components/ context/ pages/
```

Mock payment is intentional; no real card details are collected. Image upload uses local disk for development, with Cloudinary variables reserved in the environment example.

## Vercel deployment

The root `vercel.json` builds the Vite client and routes `/api/*` to the Express Vercel Function in `api/index.js`. Configure these production environment variables:

```text
MONGO_URI=mongodb+srv://...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
CLIENT_URL=https://your-project.vercel.app
NODE_ENV=production
```

The frontend uses the same-origin `/api` path by default, so `VITE_API_URL` is not required on Vercel.
