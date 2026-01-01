# SavePaws - Donation Portal Module (Sprint 1)

This is the SavePaws animal rescue system's Donation Portal Module, implementing UC010 (Browse Donation List), UC011 (Make Donation), and UC012 (Manage Donation List).

## Tech Stack

- **Frontend**: React Native + Expo (Android)
- **Backend**: Node.js + Express.js
- **Database**: MySQL
- **Payment**: PayPal API (Sandbox mode)

## Quick Start

### 1. Install Frontend Dependencies

   ```bash
   npm install
   ```

### 2. Set Up Backend Server

```bash
cd server
npm install
cp env.example .env
# Edit .env with your database and PayPal credentials
```

### 3. Set Up Database

   ```bash
mysql -u root -p < server/database/schema.sql
mysql -u root -p < server/database/seed.sql
mysql -u root -p < server/database/migration_legacy_donations.sql
mysql -u root -p < server/database/schema_expansion.sql
```

### 4. Start Backend Server

```bash
cd server
npm start
# or for development with auto-reload
npm run dev
```

### 5. Configure API URL

Edit `config/api.ts` and update `API_BASE_URL`:
- For Android emulator: `http://10.0.2.2:3000`
- For physical device: `http://YOUR_COMPUTER_IP:3000`

### 6. Start Frontend App

```bash
npm start
# or for Android
npm run android
```

### 7. Launch the App

- Landing screen lets you choose **User** (donor flow) or **Admin** (UC012 management).
- Admin actions immediately hit the live API—keep the backend running while testing.

## Documentation

- **[Setup Instructions](SETUP_INSTRUCTIONS.md)** - Complete setup guide
- **[API Documentation](API_DOCUMENTATION.md)** - API endpoint reference
- **[PayPal Setup](PAYPAL_SETUP.md)** - PayPal sandbox integration guide

## Project Structure

```
SavePaws-Sprint1/
├── app/                    # React Native screens (Expo Router)
│   ├── index.tsx          # Landing / role selection screen
│   ├── animal-list.tsx    # Animal List Screen (UC010)
│   ├── animal-details.tsx # Animal Details Screen (UC010)
│   ├── donation.tsx       # Donation Screen (UC011)
│   └── admin/             # Admin portal (UC012)
│       ├── dashboard.tsx
│       ├── add-animal.tsx
│       └── edit-animal.tsx
├── config/
│   └── api.ts             # API configuration
├── services/
│   └── api.ts             # Shared API helpers (user & admin)
├── server/                # Backend server
│   ├── server.js          # Express server entry point
│   ├── config/            # Database configuration
│   ├── controllers/       # Request handlers
│   ├── routes/            # API routes
│   ├── services/          # Business logic (PayPal)
│   └── database/          # SQL scripts
└── package.json           # Frontend dependencies
```

## Features

- ✅ Browse list of animals needing donations
- ✅ View detailed animal profiles with funding progress
- ✅ Make donations with PayPal integration
- ✅ Real-time funding progress tracking
- ✅ Automatic status updates when funding goals are reached
- ✅ Pull-to-refresh functionality
- ✅ Error handling and validation
- ✅ Loading states and user feedback
- ✅ Admin dashboard with add/edit/delete/archive
- ✅ Validation on both frontend and backend for admin workflows
- ✅ Landing page for quick role selection

## Requirements

- Node.js (v16+)
- MySQL (v8.0+)
- Expo CLI
- PayPal Developer Account (for sandbox testing)

## Learn more

- [Expo documentation](https://docs.expo.dev/)
- [React Native documentation](https://reactnative.dev/)
- [Express.js documentation](https://expressjs.com/)
