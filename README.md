# Tabora AgriDairy Cattle Monitoring & Marketplace

An extended full-stack production-grade Tabora AgriDairy Cattle Monitoring Dashboard and Direct-to-Consumer Marketplace.

## New Features
- **Public Landing Page**: Modern hero section, features overview, and pricing.
- **Role-Based Auth**: Secure JWT authentication for Farmers, Buyers, and Admins.
- **Smart Marketplace**: 
  - Farmers: List and manage dairy products (Milk, Yogurt, Cheese).
  - Buyers: Browse, add to cart, and "checkout" to create orders.
- **Settings & Profile**: Update profile info, role-based settings, and password management.
- **Protected Routes**: Secure dashboard and management modules with role-based permissions.

## Tech Stack
- **Frontend**: React 18, React Router, Tailwind CSS, Recharts, Lucide Icons, Axios.
- **Backend**: Node.js, Express.js, MySQL (mysql2), JWT, BcryptJS.

## Database Update
The database schema has been updated to include:
- `users`: Authentication and profile data.
- `products`: Marketplace listings.
- `orders` & `order_items`: Sales tracking.

## Installation

1. **Install Dependencies**:
   Run the following from the root:
   ```bash
   npm run install-all
   ```

2. **Database Setup**:
   - Run the updated `server/database/schema.sql` in your MySQL server.
   - Update `server/.env` with your `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, and a `JWT_SECRET`.

3. **Run the Application**:
   ```bash
   npm run dev
   ```

## Folder Structure Update
- `client/src/context/`: Added `AuthContext` and `CartContext`.
- `client/src/components/`: Added `ProtectedRoute`.
- `client/src/pages/`: Added `LandingPage`, `Login`, `Register`, `Marketplace`, `Cart`, and `Settings`.
- `server/middleware/`: Added `auth.js` for JWT and Role verification.
- `server/routes/`: Added `auth.js` and `marketplace.js`.
