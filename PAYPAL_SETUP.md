# PayPal Integration Setup Guide

This guide explains how to set up PayPal sandbox integration for the SavePaws Donation Portal.

## Step 1: Create PayPal Developer Account

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/)
2. Click "Sign Up" or "Log In"
3. Complete the registration process

## Step 2: Create Sandbox App

1. After logging in, navigate to **Dashboard** → **My Apps & Credentials**
2. Click **"Create App"** button
3. Fill in the app details:
   - **App Name**: SavePaws Donation Portal (or any name)
   - **Merchant**: Select your sandbox business account
   - **Features**: Select "Accept Payments"
4. Click **"Create App"**

## Step 3: Get API Credentials

1. After creating the app, you'll see:
   - **Client ID**
   - **Secret**
2. Copy these credentials
3. Add them to your `server/.env` file:
   ```env
   PAYPAL_CLIENT_ID=your_client_id_here
   PAYPAL_CLIENT_SECRET=your_secret_here
   PAYPAL_ENVIRONMENT=sandbox
   ```

## Step 4: Create Sandbox Test Accounts

1. In PayPal Developer Dashboard, go to **Accounts** → **Sandbox** → **Accounts**
2. Click **"Create Account"**
3. Create two test accounts:
   - **Business Account**: For receiving payments
   - **Personal Account**: For testing donations

## Step 5: Test Payment Flow

### Using Sandbox Test Accounts

1. **Business Account Credentials:**
   - Email: Use the business account email from sandbox
   - Password: Set during account creation

2. **Personal Account Credentials:**
   - Email: Use the personal account email from sandbox
   - Password: Set during account creation

### Testing in Application

1. Start your backend server
2. Make a donation through the app
3. When redirected to PayPal (if using web flow), use sandbox credentials
4. Complete the payment
5. Verify transaction in PayPal sandbox dashboard

## Step 6: Verify Integration

### Check Server Logs

When processing a donation, check server logs for:
- PayPal API calls
- Transaction IDs
- Payment status

### Check Database

Verify the transaction was recorded:
```sql
SELECT * FROM donation_transaction 
ORDER BY transaction_date DESC 
LIMIT 1;
```

## Important Notes

### Sandbox vs Live

- **Sandbox**: For testing, uses fake money
- **Live**: For production, uses real money

**Never use live credentials in development!**

### Testing Without PayPal

If you don't want to set up PayPal immediately, the server will simulate successful payments when PayPal credentials are not configured. Check `server/services/paypalService.js` for the fallback logic.

### Security Best Practices

1. **Never commit `.env` file to version control**
2. **Use environment variables for all sensitive data**
3. **Rotate credentials regularly**
4. **Use HTTPS in production**
5. **Validate all payment data server-side**

## Troubleshooting

### "Invalid Client ID"

- Verify credentials are correct in `.env`
- Check for extra spaces or quotes
- Ensure you're using sandbox credentials (not live)

### "Payment Failed"

- Check PayPal sandbox account status
- Verify account has sufficient balance (for testing)
- Review server error logs
- Check network connectivity

### "CORS Errors"

- PayPal API should handle CORS automatically
- If issues persist, check backend CORS configuration

## Production Deployment

When ready for production:

1. Create a **Live App** in PayPal Developer Dashboard
2. Get **Live Client ID and Secret**
3. Update `.env`:
   ```env
   PAYPAL_ENVIRONMENT=live
   PAYPAL_CLIENT_ID=your_live_client_id
   PAYPAL_CLIENT_SECRET=your_live_secret
   ```
4. Test thoroughly in sandbox first!
5. Update return/cancel URLs to production URLs

## Additional Resources

- [PayPal REST API Documentation](https://developer.paypal.com/docs/api/overview/)
- [PayPal Checkout SDK](https://developer.paypal.com/docs/checkout/)
- [PayPal Sandbox Testing Guide](https://developer.paypal.com/docs/api-basics/sandbox/)

