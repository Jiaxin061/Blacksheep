const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const animalsRoutes = require("./routes/animals");
const donationRoutes = require("./routes/donations");
const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/user");
const adminFundsRoutes = require("./routes/adminFunds");
const rewardsRoutes = require("./routes/rewards");
const adminRewardsRoutes = require("./routes/adminRewards");
const userController = require("./controllers/userController"); // Import Controller for public route

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- Routes ---

// Public: Get all users for login screen (No Auth Required)
app.get("/api/users", userController.getAllUsers);

// Existing Routes
app.use("/api/animals", animalsRoutes);
app.use("/api/admin/animals", adminRoutes);
app.use("/api", donationRoutes);

// Protected Routes (Auth handled inside router)
app.use("/api/user", userRoutes);
app.use("/api/admin/rewards", adminRewardsRoutes); // NEW
app.use("/api/admin", adminFundsRoutes);
app.use("/api/rewards", rewardsRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "SavePaws API is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
});