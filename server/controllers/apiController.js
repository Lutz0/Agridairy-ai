const pool = require('../config/database');

// Cattle Controller
exports.getAllCattle = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM cattle WHERE farmerId = ? ORDER BY id DESC', [req.user.id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getCattleById = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM cattle WHERE id = ? AND farmerId = ?', [req.params.id, req.user.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Cattle not found or access denied' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createCattle = async (req, res) => {
    const { 
        tagId, name, breed, age, weight, healthStatus, location, 
        temperature, heartRate, activity, milkProduction, 
        aiHealthRisk, aiBehaviorPattern 
    } = req.body;
    
    try {
        console.log('Creating cattle for user:', req.user.id, 'Data:', req.body);
        
        // Basic validation and type conversion
        const parsedAge = age ? parseInt(age) : null;
        const parsedWeight = weight ? parseFloat(weight) : null;
        const parsedTemp = temperature ? parseFloat(temperature) : 38.5;
        const parsedMilk = milkProduction ? parseFloat(milkProduction) : 0;
        const parsedRisk = aiHealthRisk ? parseFloat(aiHealthRisk) : 0.05;

        const [result] = await pool.query(
            `INSERT INTO cattle (
                tagId, name, breed, age, weight, healthStatus, location, 
                temperature, heartRate, activity, milkProduction, 
                aiHealthRisk, aiBehaviorPattern, farmerId
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                tagId, name, breed, parsedAge, parsedWeight, healthStatus || 'healthy', 
                location || 'Farm', parsedTemp, heartRate || 65, activity || 'grazing', 
                parsedMilk, parsedRisk, aiBehaviorPattern || 'Normal', req.user.id
            ]
        );
        res.status(201).json({ id: result.insertId, ...req.body, farmerId: req.user.id });
    } catch (err) {
        console.error('Error creating cattle:', err);
        // Return a more descriptive error if it's a DB issue
        if (err.code === 'ER_BAD_FIELD_ERROR') {
            return res.status(500).json({ message: 'Database schema mismatch. Please ensure the farmerId column exists in the cattle table.' });
        }
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'A cattle with this Tag ID already exists.' });
        }
        res.status(500).json({ message: err.message });
    }
};

exports.updateCattle = async (req, res) => {
    const { tagId, name, breed, age, weight, healthStatus, location, temperature, heartRate, activity, milkProduction, aiHealthRisk, aiBehaviorPattern } = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE cattle SET tagId=?, name=?, breed=?, age=?, weight=?, healthStatus=?, location=?, temperature=?, heartRate=?, activity=?, milkProduction=?, aiHealthRisk=?, aiBehaviorPattern=? WHERE id=? AND farmerId=?',
            [tagId, name, breed, age, weight, healthStatus, location, temperature, heartRate, activity, milkProduction, aiHealthRisk, aiBehaviorPattern, req.params.id, req.user.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Cattle not found or access denied' });
        res.json({ message: 'Cattle updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteCattle = async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM cattle WHERE id = ? AND farmerId = ?', [req.params.id, req.user.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Cattle not found or access denied' });
        res.json({ message: 'Cattle deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Milk Controller
exports.getAllMilkRecords = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT m.* FROM milk_records m 
            JOIN cattle c ON m.cattleId = c.id 
            WHERE c.farmerId = ? 
            ORDER BY m.timestamp DESC
        `, [req.user.id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMilkDailySummary = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT DATE(m.timestamp) as date, SUM(m.quantity) as totalQuantity, AVG(m.temperature) as avgTemp 
            FROM milk_records m
            JOIN cattle c ON m.cattleId = c.id
            WHERE c.farmerId = ?
            GROUP BY DATE(m.timestamp) 
            ORDER BY date DESC 
            LIMIT 7
        `, [req.user.id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createMilkRecord = async (req, res) => {
    const { tagId, quantity, quality, temperature, location } = req.body;
    try {
        console.log('Creating milk record for user:', req.user.id, 'Tag:', tagId);
        
        // Find cattleId by tagId and ensure it belongs to the current farmer
        const [cattle] = await pool.query(
            'SELECT id FROM cattle WHERE tagId = ? AND farmerId = ?', 
            [tagId, req.user.id]
        );
        
        if (cattle.length === 0) {
            console.error('Cattle not found for tag:', tagId, 'and farmer:', req.user.id);
            return res.status(404).json({ 
                message: `Cattle with Tag ID "${tagId}" not found in your inventory. Please add the cattle first.` 
            });
        }
        
        const cattleId = cattle[0].id;
        const [result] = await pool.query(
            'INSERT INTO milk_records (cattleId, tagId, quantity, quality, temperature, location) VALUES (?, ?, ?, ?, ?, ?)',
            [cattleId, tagId, quantity, quality, temperature, location]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (err) {
        console.error('Error creating milk record:', err);
        res.status(500).json({ message: err.message });
    }
};

// Health Controller
exports.getHealthSummary = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT healthStatus, COUNT(*) as count 
            FROM cattle 
            WHERE farmerId = ?
            GROUP BY healthStatus
        `, [req.user.id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getHealthAlerts = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT * FROM cattle 
            WHERE farmerId = ? AND (
                healthStatus IN ('sick', 'critical') 
                OR aiHealthRisk > 0.7
            )
            ORDER BY aiHealthRisk DESC
        `, [req.user.id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Health History Controllers
exports.getHealthHistory = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT h.* FROM health_records h
            JOIN cattle c ON h.cattleId = c.id
            WHERE c.farmerId = ?
            ORDER BY h.timestamp DESC
        `, [req.user.id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getHealthHistoryByCattle = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT h.* FROM health_records h
            JOIN cattle c ON h.cattleId = c.id
            WHERE h.cattleId = ? AND c.farmerId = ?
            ORDER BY h.timestamp DESC
        `, [req.params.cattleId, req.user.id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createHealthRecord = async (req, res) => {
    const { cattleId, tagId, recordType, description, weight, cost, nextFollowUp } = req.body;
    try {
        // Ensure cattle exists and belongs to farmer
        const [cattle] = await pool.query('SELECT id FROM cattle WHERE id = ? AND farmerId = ?', [cattleId, req.user.id]);
        if (cattle.length === 0) return res.status(404).json({ message: 'Cattle not found or access denied' });

        const [result] = await pool.query(
            'INSERT INTO health_records (cattleId, tagId, recordType, description, weight, cost, nextFollowUp) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [cattleId, tagId, recordType, description, weight, cost, nextFollowUp]
        );

        // If weight is provided, update the cattle's current weight
        if (weight) {
            await pool.query('UPDATE cattle SET weight = ? WHERE id = ?', [weight, cattleId]);
        }

        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Dashboard Controller
exports.getDashboardStats = async (req, res) => {
    try {
        const [cattleCount] = await pool.query('SELECT COUNT(*) as total FROM cattle WHERE farmerId = ?', [req.user.id]);
        const [milkToday] = await pool.query(`
            SELECT SUM(m.quantity) as total FROM milk_records m
            JOIN cattle c ON m.cattleId = c.id
            WHERE c.farmerId = ? AND DATE(m.timestamp) = CURDATE()
        `, [req.user.id]);
        const [healthStatus] = await pool.query('SELECT healthStatus, COUNT(*) as count FROM cattle WHERE farmerId = ? GROUP BY healthStatus', [req.user.id]);
        const [recentActivity] = await pool.query(`
            (SELECT 'milk' as type, m.tagId, m.quantity as detail, m.timestamp as time 
             FROM milk_records m
             JOIN cattle c ON m.cattleId = c.id
             WHERE c.farmerId = ?)
            UNION
            (SELECT 'health' as type, tagId, healthStatus as detail, updatedAt as time 
             FROM cattle 
             WHERE farmerId = ?)
            ORDER BY time DESC LIMIT 10
        `, [req.user.id, req.user.id]);

        res.json({
            totalCattle: cattleCount[0].total,
            dailyMilk: milkToday[0].total || 0,
            healthDistribution: healthStatus,
            recentActivity
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
