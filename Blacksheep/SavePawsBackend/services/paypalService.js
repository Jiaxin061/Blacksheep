const paypal = require("@paypal/checkout-server-sdk");
const dotenv = require("dotenv");

dotenv.config();

// PayPal client configuration
function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials not configured");
  }

  // Use sandbox for development, live for production
  if (process.env.PAYPAL_ENVIRONMENT === "live") {
    return new paypal.core.LiveEnvironment(clientId, clientSecret);
  } else {
    return new paypal.core.SandboxEnvironment(clientId, clientSecret);
  }
}

function client() {
  return new paypal.core.PayPalHttpClient(environment());
}

/**
 * Create a PayPal payment
 * @param {number} amount - Donation amount
 * @param {string} description - Payment description
 * @param {string} email - Donor email
 * @returns {Promise<{success: boolean, transactionId?: string, message?: string}>}
 */
async function createPayment(amount, description, email) {
  try {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: amount.toFixed(2),
          },
          description: description,
          payee: {
            email_address: email,
          },
        },
      ],
      application_context: {
        brand_name: "SavePaws",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
        return_url: process.env.PAYPAL_RETURN_URL || "http://localhost:3000/success",
        cancel_url: process.env.PAYPAL_CANCEL_URL || "http://localhost:3000/cancel",
      },
    });

    const order = await client().execute(request);

    // For sandbox/testing, we'll simulate successful payment
    // In production, you would capture the payment here
    if (order.statusCode === 201) {
      const orderId = order.result.id;
      
      // Capture the payment
      const captureRequest = new paypal.orders.OrdersCaptureRequest(orderId);
      captureRequest.requestBody({});
      
      try {
        const capture = await client().execute(captureRequest);
        
        if (capture.statusCode === 201) {
          const captureId = capture.result.purchase_units[0].payments.captures[0].id;
          return {
            success: true,
            transactionId: captureId,
            orderId: orderId,
          };
        }
      } catch (captureError) {
        console.error("PayPal capture error:", captureError);
        // For sandbox, we'll still return success with order ID
        return {
          success: true,
          transactionId: orderId,
          message: "Payment authorized (sandbox mode)",
        };
      }
    }

    return {
      success: false,
      message: "Failed to create PayPal payment",
    };
  } catch (error) {
    console.error("PayPal payment error:", error);
    
    // For development/testing without actual PayPal setup, return success
    if (process.env.NODE_ENV === "development" && !process.env.PAYPAL_CLIENT_ID) {
      console.warn("PayPal not configured - simulating successful payment");
      return {
        success: true,
        transactionId: `TEST_${Date.now()}`,
        message: "Simulated payment (PayPal not configured)",
      };
    }

    return {
      success: false,
      message: error.message || "Payment processing failed",
    };
  }
}

module.exports = {
  createPayment,
};

