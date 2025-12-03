# SavePaws Donation Portal - Setup Instructions

This guide will help you set up and run the SavePaws Donation Portal module locally.

## Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn
- Expo CLI (for mobile app)
- PayPal Developer Account (for sandbox testing)

---

## Part 1: Database Setup

### 1.1 Create Database

1. Open MySQL command line or MySQL Workbench
2. Run the schema file:
   ```bash
   mysql -u root -p < server/database/schema.sql
   ```
3. Seed the database with sample data:
   ```bash
   mysql -u root -p < server/database/seed.sql
   ```

### 1.2 Verify Database

Connect to MySQL and verify tables were created:
```sql
USE savepaws;
SHOW TABLES;
SELECT * FROM animal_profile;
```

---

## Part 2: Backend Server Setup

### 2.1 Install Dependencies

```bash
cd server
npm install
```

### 2.2 Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` file with your configuration:
   ```env
   PORT=3000
   NODE_ENV=development
   
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=savepaws
   
   PAYPAL_CLIENT_ID=your_paypal_client_id
   PAYPAL_CLIENT_SECRET=your_paypal_client_secret
   PAYPAL_ENVIRONMENT=sandbox
   PAYPAL_RETURN_URL=http://localhost:3000/success
   PAYPAL_CANCEL_URL=http://localhost:3000/cancel
   ```

### 2.3 PayPal Sandbox Setup

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/)
2. Log in or create an account
3. Navigate to "My Apps & Credentials"
4. Create a new app (Sandbox)
5. Copy the Client ID and Secret to your `.env` file

**Note:** For testing without PayPal, the server will simulate successful payments if PayPal credentials are not configured.

### 2.4 Start Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server should start on `http://localhost:3000`

---

## Part 3: Frontend (React Native) Setup

### 3.1 Install Dependencies

From the project root:
```bash
npm install
```

### 3.2 Configure API URL

Edit `config/api.ts` and update the `API_BASE_URL`:

```typescript
export const API_BASE_URL = __DEV__
  ? "http://10.0.2.2:3000" // Android emulator
  : "https://your-production-api.com";
// For physical devices replace 10.0.2.2 with your computer's IP.
```

**Finding your computer's IP:**
- Windows: `ipconfig` (look for IPv4 Address)
- Mac/Linux: `ifconfig` or `ip addr`

### 3.3 Start Expo Development Server

```bash
npm start
```

Or for Android specifically:
```bash
npm run android
```

### 3.4 Testing on Physical Device

1. Make sure your phone and computer are on the same Wi-Fi network
2. Update `config/api.ts` with your computer's local IP address
3. Scan the QR code with Expo Go app (Android) or Camera app (iOS)

### 3.5 Launching the App

- The landing screen lets you choose **Continue as User** (donor flow) or **Admin Portal**.
- Admin actions talk directly to the backend—keep the Express server running during tests.

---

## Part 4: Testing the Application

### 4.1 Test Animal List Screen

1. Open the app
2. You should see a list of animals with photos, names, and progress bars
3. Pull down to refresh the list
4. Tap on an animal card to view details

### 4.2 Test Animal Details Screen

1. From the list, tap on an animal
2. View the full animal profile including:
   - Photo
   - Name and type
   - Rescue story
   - Funding progress
   - Status badge
3. Tap "Donate Now" button

### 4.3 Test Donation Screen

1. Fill in the donation form:
   - Donation amount (required)
   - Donor name (required)
   - Donor email (required)
   - Donation type (One-time or Monthly)
2. Tap "Process Payment"
3. Payment will be processed through PayPal (sandbox)
4. On success, you'll see a confirmation message

### 4.4 Verify Database Updates

After a successful donation:
```sql
SELECT * FROM donation_transaction ORDER BY transaction_date DESC LIMIT 1;
SELECT * FROM animal_profile WHERE animalID = 1;
```

The `amountRaised` should be updated, and a new transaction should be recorded.

### 4.5 Admin Dashboard

1. From the landing page tap **Admin Portal**.
2. Confirm all animal profiles appear (all statuses).
3. Switch the status filter chips (All, Active, Funded, Adopted, Archived) and verify filtering.
4. Pull down to refresh and confirm latest data is loaded.

### 4.6 Add Animal (UC012 - Normal Flow 3)

1. Tap **+ Add New Animal**.
2. Fill in all fields (Name, Type, Story, Funding Goal, Photo URL, Status).
3. Submit and confirm success toast, then verify the new profile appears on the dashboard and in the user list.
4. Attempt to submit with invalid data to verify validation messages.

### 4.7 Edit Animal (UC012 - Normal Flow 4)

1. From the dashboard tap **Edit** on an animal.
2. Modify fields and save.
3. Confirm the dashboard reflects changes and the user list updates as well.

### 4.8 Delete & Archive (UC012 - Exception EP1)

1. Select an animal with **no donations** and use **Delete** → confirm it is removed.
2. Select an animal **with donations** and tap **Delete** → warning appears.
   - Tap **Archive Instead** to archive and confirm status changes to Archived.
   - Archived animals no longer appear on the user list (UC010).

### 4.9 Empty State

- Delete or archive all animals and verify the dashboard shows “No animal profiles found for this filter.”

---

## Troubleshooting

### Backend Issues

**Database Connection Error:**
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database `savepaws` exists

**Port Already in Use:**
- Change `PORT` in `.env` to a different port (e.g., 3001)
- Update frontend `API_BASE_URL` accordingly

### Frontend Issues

**Cannot Connect to API:**
- Verify backend server is running
- Check `API_BASE_URL` in `config/api.ts`
- For physical device, ensure correct IP address
- For emulator, use `10.0.2.2:3000`
- Check firewall settings

**PayPal Payment Fails:**
- Verify PayPal credentials in `.env`
- Check PayPal sandbox account status
- Review server logs for error messages

### Common Errors

**"Network Error" in App:**
- Backend server not running
- Wrong API URL
- CORS issues (should be handled by backend)

**"Animal not found":**
- Database not seeded
- Wrong animal ID

**"Payment processing failed":**
- PayPal credentials incorrect
- Network connectivity issues
- Check server logs

---

## Project Structure

```
SavePaws-Sprint1/
├── app/                    # React Native screens (Expo Router)
│   ├── index.tsx          # Animal List Screen
│   ├── animal-details.tsx # Animal Details Screen
│   └── donation.tsx       # Donation Screen
├── config/
│   └── api.ts             # API configuration
├── server/                # Backend server
│   ├── server.js          # Express server entry point
│   ├── config/
│   │   └── database.js    # Database connection
│   ├── controllers/       # Request handlers
│   ├── routes/            # API routes
│   ├── services/          # Business logic (PayPal)
│   └── database/          # SQL scripts
│       ├── schema.sql     # Database schema
│       └── seed.sql       # Sample data
└── package.json           # Frontend dependencies
```

---

## Next Steps

- Implement UC012 (Manage Donation List) for admin features
- Add user authentication
- Implement monthly recurring donations
- Add email notifications
- Deploy to production

---

## Support

For issues or questions, please refer to the Sprint 1 documentation or contact the development team.

