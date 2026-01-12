import express from 'express';
const router = express.Router();

// Test endpoint for frontend connection
router.get("/test", async (req, res) => {
    res.json({ 
        success: true, 
        message: "Backend API is working!",
        timestamp: new Date().toISOString()
    });
});

router.post("/register", async(req, res) => {
    res.send("Register");
});

router.post("/login", async (req, res) => {
    res.send("Login");
});

export default router;
