const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads/animals");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-random-originalname
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `animal-${uniqueSuffix}${ext}`);
  },
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  const allowedMimes = ["image/jpeg", "image/jpg", "image/png"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, JPG, and PNG images are allowed."
      ),
      false
    );
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024,   // New: 20MB (20 * 1024 * 1024 bytes)
  },
});

module.exports = upload;

