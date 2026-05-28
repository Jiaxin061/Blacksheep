const db = require("../config/database");
<<<<<<< HEAD

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
=======
const { query } = db;

/**
 * Get User Reward Balance
 */
exports.getRewardBalance = async (req, res, next) => {
    try {
        // req.userID is provided by your authMiddleware
        const userID = req.userID;

        // 1. Calculate Active Balance
        const rows = await query(
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

        const balance = (rows && rows.length > 0) ? (rows[0].balance || 0) : 0;

        // 2. Calculate Stats
        const stats = await query(
            `SELECT 
                SUM(CASE WHEN type = 'EARN' THEN points ELSE 0 END) as totalEarned,
                ABS(SUM(CASE WHEN type = 'SPEND' THEN points ELSE 0 END)) as totalSpent
            FROM reward_point_ledger WHERE userID = ?`,
            [userID]
        );

        const userStats = (stats && stats.length > 0) ? stats[0] : { totalEarned: 0, totalSpent: 0 };

        res.json({
            success: true,
            data: {
                balance: Math.max(0, parseInt(balance)),
                totalEarned: userStats.totalEarned || 0,
                totalSpent: userStats.totalSpent || 0
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
            }
        });
    } catch (error) {
        console.error("Error getting reward balance:", error);
        next({ status: 500, message: "Failed to fetch reward balance" });
    }
};

/**
<<<<<<< HEAD
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
=======
 * Redeem Reward (Requires Transaction)
 */
exports.redeemReward = async (req, res, next) => {
    const connection = await db.getPool().getConnection();
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
    try {
        await connection.beginTransaction();

        const userID = req.userID;
        const { rewardID } = req.body;

<<<<<<< HEAD
        // 1. Get Reward & Lock it (optional row lock if needed, simply select here)
        // Check quantity and status
=======
        // 1. Get Reward & Lock it
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
        const [rewards] = await connection.query(
            "SELECT * FROM reward_item WHERE rewardID = ? FOR UPDATE",
            [rewardID]
        );
<<<<<<< HEAD
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
=======
        if (rewards.length === 0) throw { status: 404, message: "Reward not found" };

        const reward = rewards[0];
        if (reward.status !== 'Active') throw { status: 400, message: "Reward is no longer active" };
        if (reward.quantity !== null && reward.quantity <= 0) throw { status: 400, message: "Reward out of stock" };

        // 2. Validate Balance
        const [balanceRows] = await connection.query(
            `SELECT SUM(points) as balance 
             FROM reward_point_ledger 
             WHERE userID = ? 
             AND (
               (type IN ('EARN', 'ADJUST') AND (expiryDate > NOW() OR expiryDate IS NULL))
               OR 
               type = 'SPEND'
             ) FOR UPDATE`,
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
            [userID]
        );

        const currentBalance = parseInt(balanceRows[0].balance || 0);
<<<<<<< HEAD

=======
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
        if (currentBalance < reward.pointsRequired) {
            throw { status: 400, message: "Insufficient points balance" };
        }

<<<<<<< HEAD
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
=======
        // 3. Update Inventory
        if (reward.quantity !== null) {
            const newQty = reward.quantity - 1;
            await connection.query(
                "UPDATE reward_item SET quantity = ?, status = ? WHERE rewardID = ?",
                [newQty, newQty === 0 ? 'Archived' : 'Active', rewardID]
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
            );
        }

        // 4. Create Redemption Record
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + reward.validityMonths);
<<<<<<< HEAD
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
=======
        const qrCodeData = `REW-${userID}-${Date.now()}`;

        const [redemptionResult] = await connection.query(
            `INSERT INTO redemption_record 
             (userID, rewardID, rewardTitle, partnerName, pointsSpent, qrCodeData, expiryDate)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userID, reward.rewardID, reward.title, reward.partnerName, reward.pointsRequired, qrCodeData, expiryDate]
        );

        // 5. Update Ledger (SPEND)
        await connection.query(
            `INSERT INTO reward_point_ledger 
             (userID, points, type, source, referenceID) 
             VALUES (?, ?, 'SPEND', 'REWARD_REDEMPTION', ?)`,
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
            [userID, -reward.pointsRequired, redemptionResult.insertId]
        );

        await connection.commit();
<<<<<<< HEAD

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
=======
        res.json({
            success: true,
            message: "Reward redeemed successfully",
            data: { redemptionID: redemptionResult.insertId, qrCodeData }
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
        });

    } catch (error) {
        await connection.rollback();
<<<<<<< HEAD
        console.error("Redemption error:", error);
=======
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
        next(error);
    } finally {
        connection.release();
    }
};

/**
<<<<<<< HEAD
=======
 * Get Active Reward Catalogue
 */
exports.getCatalogue = async (req, res, next) => {
    try {
        const rewards = await query(
            "SELECT * FROM reward_item WHERE status = 'Active' ORDER BY pointsRequired ASC"
        );
        res.json({ success: true, data: rewards });
    } catch (error) {
        console.error("Error fetching catalogue:", error);
        next({ status: 500, message: "Failed to fetch reward catalogue" });
    }
};

/**
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
 * Get User Redemption History
 */
exports.getHistory = async (req, res, next) => {
    try {
        const userID = req.userID;
<<<<<<< HEAD
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
=======
        // ordering by 1st column (PK) desc as proxy for time if created_at is not explicitly known
        const history = await query(
            "SELECT * FROM redemption_record WHERE userID = ? ORDER BY 1 DESC",
            [userID]
        );
        res.json({ success: true, data: history });
    } catch (error) {
        console.error("Error fetching history:", error);
        next({ status: 500, message: "Failed to fetch redemption history" });
    }
};

/**
 * Get Reward Details
 */
exports.getRewardDetail = async (req, res, next) => {
    try {
        const { rewardID } = req.params;
        const rewards = await query(
            "SELECT * FROM reward_item WHERE rewardID = ?",
            [rewardID]
        );

        if (rewards.length === 0) {
            return res.status(404).json({ success: false, message: "Reward not found" });
        }

        res.json({ success: true, data: rewards[0] });
    } catch (error) {
        console.error("Error fetching reward detail:", error);
        next(error);
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
    }
};

/**
<<<<<<< HEAD
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
=======
 * Create New Reward (Admin)
 */
exports.createReward = async (req, res, next) => {
    try {
        console.log("📝 Create Reward - Headers:", req.headers['content-type']);
        console.log("📝 Create Reward - Body:", req.body);
        console.log("📝 Create Reward - File:", req.file);

        // Extract and convert undefined to null
        const title = req.body.title || null;
        const partnerName = req.body.partnerName || null;
        const category = req.body.category || null;
        const description = req.body.description || null;
        const pointsRequired = req.body.pointsRequired ? parseInt(req.body.pointsRequired) : null;
        const validityMonths = req.body.validityMonths ? parseInt(req.body.validityMonths) : null;
        const terms = req.body.terms || null;
        const quantity = req.body.quantity ? parseInt(req.body.quantity) : null;

        let imageURL = req.body.imageURL || null;
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
        if (req.file) {
            imageURL = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        }

<<<<<<< HEAD
        if (!title || !partnerName || !category || !pointsRequired || !validityMonths) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
=======
        // Validation
        if (!title || !partnerName || !category || !pointsRequired || !validityMonths) {
            console.error("❌ Missing required fields:", { title, partnerName, category, pointsRequired, validityMonths });
            return res.status(400).json({
                success: false,
                message: "Missing required fields: title, partnerName, category, pointsRequired, validityMonths"
            });
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
        }

        const rewardID = `rew_${Date.now()}`;

<<<<<<< HEAD
        await db.query(
=======
        console.log("✅ Inserting reward:", { rewardID, title, partnerName, category, pointsRequired, validityMonths });

        await query(
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
            `INSERT INTO reward_item 
            (rewardID, title, partnerName, category, description, imageURL, pointsRequired, validityMonths, terms, quantity)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [rewardID, title, partnerName, category, description, imageURL, pointsRequired, validityMonths, terms, quantity]
        );

<<<<<<< HEAD
=======
        console.log("✅ Reward created successfully:", rewardID);

>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
        res.status(201).json({
            success: true,
            message: "Reward created successfully",
            data: { rewardID }
        });
    } catch (error) {
<<<<<<< HEAD
        console.error("Error creating reward:", error);
=======
        console.error("❌ Error creating reward:", error);
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
        next(error);
    }
};

/**
 * Update Reward
 */
<<<<<<< HEAD
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
=======

exports.updateReward = async (req, res, next) => {
    try {
        const { rewardID } = req.params;

        // Extract fields and convert undefined to null for SQL
        const description = req.body.description || null;
        const pointsRequired = req.body.pointsRequired ? parseInt(req.body.pointsRequired) : null;
        const validityMonths = req.body.validityMonths ? parseInt(req.body.validityMonths) : null;
        const terms = req.body.terms || null;
        const quantity = req.body.quantity !== undefined ? parseInt(req.body.quantity) : null;
        const status = req.body.status || 'Active';

        // Image Handling
        let imageURL = req.body.imageURL || null;
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
        if (req.file) {
            imageURL = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        }

        // Auto-archive logic if quantity becomes 0
        let newStatus = status;
<<<<<<< HEAD
        if (quantity !== undefined && parseInt(quantity) === 0) {
=======
        if (quantity !== null && quantity === 0) {
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
            newStatus = 'Archived';
        }

        // Dynamic Query Construction to handle optional image update
<<<<<<< HEAD
        let query = `UPDATE reward_item SET description = ?, pointsRequired = ?, validityMonths = ?, terms = ?, quantity = ?, status = ?`;
        let params = [description, pointsRequired, validityMonths, terms, quantity, newStatus];

        if (imageURL) {
            query += `, imageURL = ?`;
            params.push(imageURL);
        }

        query += ` WHERE rewardID = ?`;
        params.push(rewardID);

        await db.query(query, params);
=======
        let sql = `UPDATE reward_item SET description = ?, pointsRequired = ?, validityMonths = ?, terms = ?, quantity = ?, status = ?`;
        let params = [description, pointsRequired, validityMonths, terms, quantity, newStatus];

        if (imageURL) {
            sql += `, imageURL = ?`;
            params.push(imageURL);
        }

        sql += ` WHERE rewardID = ?`;
        params.push(rewardID);

        await query(sql, params);
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0

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
<<<<<<< HEAD
        const [redemptions] = await db.query(
=======
        const redemptions = await query(
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
            "SELECT COUNT(*) as count FROM redemption_record WHERE rewardID = ?",
            [rewardID]
        );

        if (redemptions[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete reward with redemption history. Archive it instead."
            });
        }

<<<<<<< HEAD
        await db.query("DELETE FROM reward_item WHERE rewardID = ?", [rewardID]);
=======
        await query("DELETE FROM reward_item WHERE rewardID = ?", [rewardID]);
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0

        res.json({
            success: true,
            message: "Reward deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting reward:", error);
        next(error);
    }
};
<<<<<<< HEAD
=======

/**
 * Get All Rewards (Admin)
 * Logic: Fetch all items regardless of status for management
 */
exports.getAllRewards = async (req, res, next) => {
    try {
        const rewards = await query(
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
>>>>>>> 39011196545436b3524b23d6b65c10c1f47f06e0
