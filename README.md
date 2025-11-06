# Tiffin Ledger

Track daily tiffin deliveries, manage vendors, generate bills, and keep meal records with ease. Tiffin Ledger is a full‑stack application built for individuals and small providers to streamline daily meal tracking and billing.

Note: As of the latest release, meal records support three meals per day (breakfast, lunch, dinner).

## Monorepo
- backend/: Node.js + Express + MongoDB (Mongoose)
- frontend/: Next.js (App Router) + Tailwind CSS

## Key Features
- Secure authentication (JWT)
- Tiffin tracking per user
- Vendor management and assignment
- Meal plans per vendor with three meal slots (breakfast, lunch, dinner)
- Monthly bill generation (PDF)
- UPI payment link generation
- Profile and profile picture management (Cloudinary)

## Tech Stack
- Backend: Node.js, Express, Mongoose, JWT, EJS (PDF templates)
- Frontend: Next.js (TypeScript), Tailwind CSS, shadcn/ui
- Storage & Infra: MongoDB Atlas (or self‑hosted), Cloudinary, Vercel (backend ready)

## Architecture Overview
- RESTful API served under /tiffin, /user, /payment, /profile, /profile-pic
- MongoDB for persistence
- Cloudinary for media storage (profile pictures)
- PDF generation for bills

## Environment Variables
Create a .env in backend/ with the following variables:
- PORT: Port for the API server (e.g., 4000)
- MONGODB_URI: MongoDB connection string
- JWT_SECRET: Secret for JWT signing
- CLOUDINARY_CLOUD_NAME: Cloudinary cloud name
- CLOUDINARY_API_KEY: Cloudinary API key
- CLOUDINARY_API_SECRET: Cloudinary API secret

Optional (frontend): Configure the API base URL used by your HTTP client. Ensure the frontend points to the backend server URL in your interceptor or environment configuration.

## Getting Started (Local Development)
1) Prerequisites
- Node.js 18+
- MongoDB instance
- Cloudinary account (for profile images)

2) Install dependencies
- Backend: from backend/ run: npm install
- Frontend: from frontend/ run: npm install

3) Configure environment
- Add backend/.env as described above

4) Run
- Backend: npm run dev (from backend/) — starts Express on PORT
- Frontend: npm run dev (from frontend/) — starts Next.js on http://localhost:3000

## API Overview
Base URL examples:
- Local: http://localhost:PORT
- Deployed: your hosted URL (e.g., Vercel)

Authentication (/user)
- POST /user/signup — create account
- POST /user/login — login, receive JWT

Tiffin Tracking (/tiffin)
- POST /tiffin/track/add — add/update a day’s tracking
- POST /tiffin/track/add-multiple — bulk updates
- GET /tiffin/track/get — get tracking data
- GET /tiffin/tiffin-bill/:userId — combined tiffin and billing data

Billing (/tiffin)
- POST /tiffin/generate — generate monthly bill PDF

Vendors (/tiffin)
- GET /tiffin/vendors — list vendors
- GET /tiffin/vendors/:id — get vendor
- POST /tiffin/create-vendor — create vendor
- PUT /tiffin/update-vendor/:id — update vendor
- DELETE /tiffin/delete-vendor/:id — delete vendor
- DELETE /tiffin/delete-multiple-vendors — bulk delete
- POST /tiffin/assign-vendor — assign vendor to user

Meals per Vendor (/tiffin)
- GET /tiffin/get-meals/:vendorId — list meals
- POST /tiffin/add-meal — add a single day meal set
- POST /tiffin/add-multiple-meals — bulk insert meals

Payment (/payment)
- POST /payment — generate UPI payment link (amount, orderId)

Profile (/profile, /profile-pic)
- Profile CRUD and profile picture upload via Cloudinary

## Data Model Highlight: Meal
Meals now support three meals per day:
- vendorId: ObjectId (Vendor)
- date: Date
- mealDetails: { breakfast?: string, lunch?: string, dinner?: string }

## Deployment
- Backend includes vercel.json and can be deployed to Vercel as a Node serverless app
- Ensure environment variables are set in your hosting platform
- Frontend can be deployed to Vercel or any Node-compatible host

## Security
- Use strong JWT_SECRET in production
- Restrict CORS to trusted origins
- Never commit secrets to version control

## Contributing
- Fork and create a feature branch
- Submit a PR with a clear description and testing notes

## License
ISC

## Maintainer
Neelesh