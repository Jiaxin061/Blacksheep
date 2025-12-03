const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const animalsRoutes = require("./routes/animals");
const donationRoutes = require("./routes/donations");
const adminRoutes = require("./routes/admin");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/animals", animalsRoutes);
app.use("/api/admin/animals", adminRoutes);
app.use("/api", donationRoutes);

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

