const db = require("../config/database");

// --- REFACTORED: DB-Driven Rewards & Ledger System ---

/**
 * Get User Reward Balance
 * Logic: Sum of all valid (non-expired) 'EARN' ledger entries + Sum of all 'SPEND' entries (negative).
 */
exports.getRewardBalance = async (req, res, next) => {
    try {
        const userID = req.userID;

        // 1. Calculate Active Balance from Ledger
        // We filter EARN/ADJUST entries that haven't expired
        // We include all SPEND entries (which reduce the balance)
        const [rows] = await db.query(
            `SELECT SUM(points) as balance 
       FROM reward_point_ledger 
       WHERE userID = ? 
         AND (
           (type IN ('EARN', 'ADJUST') AND (expiryDate > NOW() OR expiryDate IS NULL))
           OR 
           type = 'SPEND'
         )`,
            [userID]
        );

        const balance = rows[0].balance || 0;

        // Optional: Get Total Earned / Spent for stats (historical)
        const [stats] = await db.query(
            `SELECT 
        SUM(CASE WHEN type = 'EARN' THEN points ELSE 0 END) as totalEarned,
        ABS(SUM(CASE WHEN type = 'SPEND' THEN points ELSE 0 END)) as totalSpent
       FROM reward_point_ledger WHERE userID = ?`,
            [userID]
        );

        res.json({
            success: true,
            data: {
                balance: Math.max(0, parseInt(balance)), // Visual safety net
                totalEarned: stats[0].totalEarned || 0,
                totalSpent: stats[0].totalSpent || 0
            }
        });
    } catch (error) {
        console.error("Error getting reward balance:", error);
        next({ status: 500, message: "Failed to fetch reward balance" });
    }
};

/**
 * Get Reward Catalogue
 * Logic: Fetch Active items from DB `reward_item`
 */
exports.getCatalogue = async (req, res, next) => {
    try {
        const [rewards] = await db.query(
            "SELECT * FROM reward_item WHERE status = 'Active' ORDER BY pointsRequired ASC"
        );

        res.json({
            success: true,
            data: rewards
        });
    } catch (error) {
        console.error("Error fetching catalogue:", error);
        next({ status: 500, message: "Failed to fetch reward catalogue" });
    }
};

/**
 * Get Reward Details
 */
exports.getRewardDetail = async (req, res, next) => {
    try {
        const { rewardID } = req.params;
        const [rows] = await db.query(
            "SELECT * FROM reward_item WHERE rewardID = ?",
            [rewardID]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Reward not found" });
        }

        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Redeem Reward
 * Logic: Transactional Ledger Update
 */
exports.redeemReward = async (req, res, next) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const userID = req.userID;
        const { rewardID } = req.body;

        // 1. Get Reward & Lock it (optional row lock if needed, simply select here)
        // Check quantity and status
        const [rewards] = await connection.query(
            "SELECT * FROM reward_item WHERE rewardID = ? FOR UPDATE",
            [rewardID]
        );
        if (rewards.length === 0) {
            throw { status: 404, message: "Reward not found" };
        }
        const reward = rewards[0];

        if (reward.status !== 'Active') {
            throw { status: 400, message: "Reward is no longer active" };
        }

        // Check Inventory
        if (reward.quantity !== null && reward.quantity <= 0) {
            throw { status: 400, message: "Reward is out of stock" };
        }

        // 2. Validate Balance (Ledger Check)
        const [balanceRows] = await connection.query(
            `SELECT SUM(points) as balance 
       FROM reward_point_ledger 
       WHERE userID = ? 
         AND (
           (type IN ('EARN', 'ADJUST') AND (expiryDate > NOW() OR expiryDate IS NULL))
           OR 
           type = 'SPEND'
         ) FOR UPDATE`, // Lock user ledger rows
            [userID]
        );

        const currentBalance = parseInt(balanceRows[0].balance || 0);

        if (currentBalance < reward.pointsRequired) {
            throw { status: 400, message: "Insufficient points balance" };
        }

        // 3. Update Inventory (Decrement Quantity)
        if (reward.quantity !== null) {
            const newQuantity = reward.quantity - 1;
            let newStatus = reward.status;

            if (newQuantity === 0) {
                newStatus = 'Archived';
            }

            await connection.query(
                "UPDATE reward_item SET quantity = ?, status = ? WHERE rewardID = ?",
                [newQuantity, newStatus, rewardID]
            );
        }

        // 4. Create Redemption Record
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + reward.validityMonths);
        const qrCodeData = `REW-${userID}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const [redemptionResult] = await connection.query(
            `INSERT INTO redemption_record 
       (userID, rewardID, rewardTitle, partnerName, pointsSpent, qrCodeData, expiryDate)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userID, reward.rewardID, reward.title, reward.partnerName, reward.pointsRequired, qrCodeData, expiryDate]
        );

        // 4. Update Ledger (SPEND)
        await connection.query(
            `INSERT INTO reward_point_ledger 
       (userID, points, type, source, referenceID) 
       VALUES (?, ?, 'SPEND', 'REWARD_REDEMPTION', ?)`,
            [userID, -reward.pointsRequired, redemptionResult.insertId]
        );

        await connection.commit();

        res.json({
            success: true,
            message: "Reward redeemed successfully",
            data: {
                redemptionID: redemptionResult.insertId,
                qrCodeData,
                expiryDate,
                rewardTitle: reward.title,
                pointsSpent: reward.pointsRequired
            }
        });

    } catch (error) {
        await connection.rollback();
        console.error("Redemption error:", error);
        next(error);
    } finally {
        connection.release();
    }
};

/**
 * Get User Redemption History
 */
exports.getHistory = async (req, res, next) => {
    try {
        const userID = req.userID;
        const [history] = await db.query(
            "SELECT * FROM redemption_record WHERE userID = ? ORDER BY redeemedDate DESC",
            [userID]
        );

        res.json({
            success: true,
            data: history
        });

    } catch (error) {
        console.error("Error fetching history:", error);
        next({ status: 500, message: "Failed to fetch history" });
    }
};
// ... existing imports ...

// --- ADMIN REWARD MANAGEMENT ---

/**
 * Get All Rewards (Admin)
 * Fetch all items regardless of status
 */
exports.getAllRewards = async (req, res, next) => {
    try {
        const [rewards] = await db.query(
            "SELECT * FROM reward_item ORDER BY createdAt DESC"
        );
        res.json({
            success: true,
            data: rewards
        });
    } catch (error) {
        console.error("Error fetching all rewards:", error);
        next({ status: 500, message: "Failed to fetch rewards" });
    }
};

/**
 * Create New Reward
 */
/**
 * Create New Reward
 */
exports.createReward = async (req, res, next) => {
    try {
        const {
            title, partnerName, category, description,
            pointsRequired, validityMonths, terms, quantity
        } = req.body;

        // Image Handling
        let imageURL = req.body.imageURL;
        if (req.file) {
            imageURL = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        }

        if (!title || !partnerName || !category || !pointsRequired || !validityMonths) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const rewardID = `rew_${Date.now()}`;

        await db.query(
            `INSERT INTO reward_item 
            (rewardID, title, partnerName, category, description, imageURL, pointsRequired, validityMonths, terms, quantity)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [rewardID, title, partnerName, category, description, imageURL, pointsRequired, validityMonths, terms, quantity]
        );

        res.status(201).json({
            success: true,
            message: "Reward created successfully",
            data: { rewardID }
        });
    } catch (error) {
        console.error("Error creating reward:", error);
        next(error);
    }
};

/**
 * Update Reward
 */
/**
 * Update Reward
 */
exports.updateReward = async (req, res, next) => {
    try {
        const { rewardID } = req.params;
        const {
            description, pointsRequired, validityMonths,
            terms, quantity, status
        } = req.body;

        // Image Handling
        let imageURL = req.body.imageURL;
        if (req.file) {
            imageURL = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        }

        // Auto-archive logic if quantity becomes 0
        let newStatus = status;
        if (quantity !== undefined && parseInt(quantity) === 0) {
            newStatus = 'Archived';
        }

        // Dynamic Query Construction to handle optional image update
        let query = `UPDATE reward_item SET description = ?, pointsRequired = ?, validityMonths = ?, terms = ?, quantity = ?, status = ?`;
        let params = [description, pointsRequired, validityMonths, terms, quantity, newStatus];

        if (imageURL) {
            query += `, imageURL = ?`;
            params.push(imageURL);
        }

        query += ` WHERE rewardID = ?`;
        params.push(rewardID);

        await db.query(query, params);

        res.json({
            success: true,
            message: "Reward updated successfully"
        });
    } catch (error) {
        console.error("Error updating reward:", error);
        next(error);
    }
};

/**
 * Delete Reward
 * Block if redemptions exist
 */
exports.deleteReward = async (req, res, next) => {
    try {
        const { rewardID } = req.params;

        // Check for redemptions
        const [redemptions] = await db.query(
            "SELECT COUNT(*) as count FROM redemption_record WHERE rewardID = ?",
            [rewardID]
        );

        if (redemptions[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete reward with redemption history. Archive it instead."
            });
        }

        await db.query("DELETE FROM reward_item WHERE rewardID = ?", [rewardID]);

        res.json({
            success: true,
            message: "Reward deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting reward:", error);
        next(error);
    }
};
