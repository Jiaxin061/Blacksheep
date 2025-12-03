# SavePaws API Documentation

## Base URL
- Development: `http://localhost:3000`
- Production: `https://your-production-api.com`

## Endpoints

### 1. Get All Active Animals
**GET** `/api/animals`

Fetches all animals with status "Active".

**Response:**
```json
[
  {
    "animalID": 1,
    "name": "Luna",
    "type": "Cat",
    "story": "Luna was found abandoned...",
    "fundingGoal": 500.00,
    "amountRaised": 150.00,
    "status": "Active",
    "photoURL": "https://example.com/image.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

**Error Responses:**
- `500`: Internal server error

---

### 2. Get Animal by ID
**GET** `/api/animals/:id`

Fetches a specific animal by ID.

**Parameters:**
- `id` (path parameter): Animal ID

**Response:**
```json
{
  "animalID": 1,
  "name": "Luna",
  "type": "Cat",
  "story": "Luna was found abandoned...",
  "fundingGoal": 500.00,
  "amountRaised": 150.00,
  "status": "Active",
  "photoURL": "https://example.com/image.jpg",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `404`: Animal not found
- `500`: Internal server error

---

### 3. Process Donation
**POST** `/api/donate`

Processes a donation payment through PayPal and records the transaction.

**Request Body:**
```json
{
  "animalID": 1,
  "donation_amount": 50.00,
  "type": "One-time",
  "donor_name": "John Doe",
  "donor_email": "john.doe@example.com"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Donation processed successfully",
  "transactionID": 123,
  "paymentID": "PAYPAL_TRANSACTION_ID"
}
```

**Error Responses:**
- `400`: Bad request (missing fields, invalid amount, invalid email, animal not active)
- `404`: Animal not found
- `500`: Internal server error

**Validation:**
- `animalID`: Required, must be a valid integer
- `donation_amount`: Required, must be a positive number
- `type`: Required, must be "One-time" or "Monthly"
- `donor_name`: Required, non-empty string
- `donor_email`: Required, valid email format

---

### 4. Admin: Get All Animals
**GET** `/api/admin/animals`

Returns every animal profile regardless of status.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "animalID": 1,
      "name": "Luna",
      "type": "Cat",
      "story": "Luna was found abandoned...",
      "fundingGoal": 500.0,
      "amountRaised": 150.0,
      "status": "Active",
      "photoURL": "https://example.com/image.jpg",
      "adminID": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 5. Admin: Create Animal
**POST** `/api/admin/animals`

Creates a new animal profile.

**Request Body:**
```json
{
  "name": "Max",
  "type": "Dog",
  "story": "Max was rescued...",
  "fundingGoal": 800,
  "photoURL": "https://example.com/max.jpg",
  "status": "Active",
  "adminID": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Animal profile created successfully",
  "data": {
    "animalID": 6,
    "name": "Max",
    "type": "Dog",
    "story": "Max was rescued...",
    "fundingGoal": 800,
    "amountRaised": 0,
    "status": "Active",
    "photoURL": "https://example.com/max.jpg",
    "adminID": 1,
    "createdAt": "2024-01-05T00:00:00.000Z",
    "updatedAt": "2024-01-05T00:00:00.000Z"
  }
}
```

**Validation Errors:**
- `400`: Missing or invalid fields (see validation middleware)
- `500`: Database error

---

### 6. Admin: Update Animal
**PUT** `/api/admin/animals/:id`

Updates an existing animal profile.

**Request Body:**
```json
{
  "name": "Max",
  "type": "Dog",
  "story": "Updated story",
  "fundingGoal": 900,
  "amountRaised": 320,
  "status": "Active",
  "photoURL": "https://example.com/max.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Animal profile updated successfully"
}
```

**Error Responses:**
- `404`: Animal not found
- `400`: Validation error
- `500`: Database error

---

### 7. Admin: Delete Animal
**DELETE** `/api/admin/animals/:id`

Deletes an animal profile. If the profile has donations (`amountRaised > 0`), deletion is blocked and a warning is returned.

**Response (Success):**
```json
{
  "success": true,
  "message": "Animal profile deleted successfully"
}
```

**Response (Active donations):**
```json
{
  "success": false,
  "code": "ACTIVE_DONATIONS",
  "message": "Cannot delete animal with active donations. Please archive instead."
}
```

---

### 8. Admin: Archive Animal
**PATCH** `/api/admin/animals/:id/archive`

Sets the animal status to `Archived`.

**Response:**
```json
{
  "success": true,
  "message": "Animal profile archived successfully"
}
```

**Error Responses:**
- `404`: Animal not found
- `500`: Database error

---

## Health Check

**GET** `/health`

Returns server status.

**Response:**
```json
{
  "status": "ok",
  "message": "SavePaws API is running"
}
```

