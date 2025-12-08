# Changelog

## [1.2.0] - 2025-12-08

### 🚀 Highlights

- Upgraded Next.js and sharp dependencies for improved performance and security.

### ✨ New Features

- Added peer dependency flags to several packages in `package-lock.json` for better dependency management.

### 🧩 Backend & APIs

- Refactored Redis client initialization to handle connection errors and timeouts more gracefully.

### 🖌️ UX/UI Improvements

- Addressed Next.js/React Flight RCE vulnerability to enhance application security.

### 🛠️ Fixes & Improvements

- Allowed empty values for profile address line2 and profilePic in the validation schema.
- Refactored models into separate TypeScript files for better code organization and maintainability.

## [1.1.0] - 2025-11-09

### 🚀 Highlights

- Vendor Revenue Analytics dashboard with KPIs (Total Revenue, Pending Amount, Projected Earnings, Collection Rate)
- Monthly performance breakdown and Recent Collections with rich UI and animations
- Quick navigation from Vendor Dashboard to Revenue Analytics; dashboard revenue card shows computed totalRevenue

### ✨ New Features

- Customers management enhancements:
  - Search by name/phone/city and filter by meal types
  - Copy-to-clipboard for phone and one-click WhatsApp messaging
  - Block/Unblock customer with optional reason via confirmation dialog
  - Session caching of customer list with automatic refresh on load
- End-user Timetable blocked-state UX:
  - When blocked by vendor, show Access Restricted screen with reason and vendor contact
  - Direct WhatsApp link to vendor; attendance, payments, and bill generation are disabled

### 🧩 Backend & APIs

- Added GET /api/vendors/revenue-stats to compute revenue, pending days, projections, and recent payments
- Added PATCH /api/vendors/users/:userId/block to toggle block/unblock per vendor with optional reason
- Enhanced GET /api/vendors/users to include blockedByVendor status and vendor meal types
- Enhanced GET /api/vendors/profile to return computed totalRevenue from PaidTracking
- Models:
  - User: added blockedByVendors[] (vendorId, reason, isBlocked, timestamps)
  - RevenueAnalytics schema scaffold added for future persistence/analytics

### 🖌️ UX/UI Improvements

- Sticky headers for Vendor Customers and Revenue pages
- Animated skeleton loaders, subtle transitions, and gradient stat cards
- Responsive layout polishing for mobile and desktop

### 🛠️ Fixes & Improvements

- More robust month/day parsing and safeguards in timetable and revenue calculations
- Consistent error toasts and session handling across vendor pages
- Minor code hygiene: Promise.all usage and map lookups for performance

### ⚠️ Notes

- No breaking changes; new user field blockedByVendors defaults safely
- Ensure vendor.amountPerDay is set to enable revenue calculations

## [1.0.0] - 2025-11-09

### 🚀 New Features

- Vendor authentication system with signup and login capabilities
- Vendor dashboard displaying customer statistics and meal overview
- Meal planning interface for scheduling daily meals
- Customer management with search and meal-type filtering
- Vendor profile editing and management
- User meal preferences tracking
- Enhanced vendor UI with responsive sidebar and mobile navigation

### 🧱 Infrastructure

- Improved database connection resilience with connection pooling
- Vendor API protection with authentication middleware

### 📦 Dependencies

- Added UI component libraries for avatars and separators
