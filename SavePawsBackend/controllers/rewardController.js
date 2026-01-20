const db = require("../config/database");
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
            }
        });
    } catch (error) {
        console.error("Error getting reward balance:", error);
        next({ status: 500, message: "Failed to fetch reward balance" });
    }
};

/**
 * Redeem Reward (Requires Transaction)
 */
exports.redeemReward = async (req, res, next) => {
    const connection = await db.getPool().getConnection();
    try {
        await connection.beginTransaction();

        const userID = req.userID;
        const { rewardID } = req.body;

        // 1. Get Reward & Lock it
        const [rewards] = await connection.query(
            "SELECT * FROM reward_item WHERE rewardID = ? FOR UPDATE",
            [rewardID]
        );
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
            [userID]
        );

        const currentBalance = parseInt(balanceRows[0].balance || 0);
        if (currentBalance < reward.pointsRequired) {
            throw { status: 400, message: "Insufficient points balance" };
        }

        // 3. Update Inventory
        if (reward.quantity !== null) {
            const newQty = reward.quantity - 1;
            await connection.query(
                "UPDATE reward_item SET quantity = ?, status = ? WHERE rewardID = ?",
                [newQty, newQty === 0 ? 'Archived' : 'Active', rewardID]
            );
        }

        // 4. Create Redemption Record
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + reward.validityMonths);
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
            [userID, -reward.pointsRequired, redemptionResult.insertId]
        );

        await connection.commit();
        res.json({
            success: true,
            message: "Reward redeemed successfully",
            data: { redemptionID: redemptionResult.insertId, qrCodeData }
        });

    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};

/**
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
 * Get User Redemption History
 */
exports.getHistory = async (req, res, next) => {
    try {
        const userID = req.userID;
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
    }
};

/**
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
        if (req.file) {
            imageURL = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        }

        // Validation
        if (!title || !partnerName || !category || !pointsRequired || !validityMonths) {
            console.error("❌ Missing required fields:", { title, partnerName, category, pointsRequired, validityMonths });
            return res.status(400).json({
                success: false,
                message: "Missing required fields: title, partnerName, category, pointsRequired, validityMonths"
            });
        }

        const rewardID = `rew_${Date.now()}`;

        console.log("✅ Inserting reward:", { rewardID, title, partnerName, category, pointsRequired, validityMonths });

        await query(
            `INSERT INTO reward_item 
            (rewardID, title, partnerName, category, description, imageURL, pointsRequired, validityMonths, terms, quantity)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [rewardID, title, partnerName, category, description, imageURL, pointsRequired, validityMonths, terms, quantity]
        );

        console.log("✅ Reward created successfully:", rewardID);

        res.status(201).json({
            success: true,
            message: "Reward created successfully",
            data: { rewardID }
        });
    } catch (error) {
        console.error("❌ Error creating reward:", error);
        next(error);
    }
};

/**
 * Update Reward
 */

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
        if (req.file) {
            imageURL = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        }

        // Auto-archive logic if quantity becomes 0
        let newStatus = status;
        if (quantity !== null && quantity === 0) {
            newStatus = 'Archived';
        }

        // Dynamic Query Construction to handle optional image update
        let sql = `UPDATE reward_item SET description = ?, pointsRequired = ?, validityMonths = ?, terms = ?, quantity = ?, status = ?`;
        let params = [description, pointsRequired, validityMonths, terms, quantity, newStatus];

        if (imageURL) {
            sql += `, imageURL = ?`;
            params.push(imageURL);
        }

        sql += ` WHERE rewardID = ?`;
        params.push(rewardID);

        await query(sql, params);

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
        const redemptions = await query(
            "SELECT COUNT(*) as count FROM redemption_record WHERE rewardID = ?",
            [rewardID]
        );

        if (redemptions[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete reward with redemption history. Archive it instead."
            });
        }

        await query("DELETE FROM reward_item WHERE rewardID = ?", [rewardID]);

        res.json({
            success: true,
            message: "Reward deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting reward:", error);
        next(error);
    }
};

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