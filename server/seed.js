const pool = require('./config/database');

const cattleData = [
    ['C-001', 'Bessie', 'Holstein', 5, 650.50, 'healthy', 'Paddock A', 38.5, 65, 'grazing', 25.4, 0.12, 'Normal'],
    ['C-002', 'Daisy', 'Jersey', 4, 520.00, 'sick', 'Barn 1', 39.8, 80, 'resting', 18.2, 0.85, 'Low Activity'],
    ['C-003', 'Molly', 'Angus', 3, 700.20, 'healthy', 'Paddock B', 38.6, 62, 'grazing', 22.1, 0.05, 'Normal'],
    ['C-004', 'Luna', 'Hereford', 6, 680.00, 'critical', 'Vet Clinic', 40.2, 95, 'resting', 5.0, 0.95, 'High Temp'],
    ['C-005', 'Bella', 'Brown Swiss', 4, 610.00, 'recovering', 'Barn 2', 38.9, 72, 'feeding', 20.5, 0.45, 'Increasing Activity'],
    ['C-006', 'Penny', 'Guernsey', 3, 540.00, 'healthy', 'Paddock A', 38.4, 64, 'moving', 24.8, 0.15, 'Normal'],
    ['C-007', 'Ginger', 'Ayrshire', 5, 590.00, 'healthy', 'Paddock B', 38.7, 66, 'grazing', 23.5, 0.08, 'Normal'],
    ['C-008', 'Ruby', 'Simmental', 2, 480.00, 'healthy', 'Barn 1', 38.5, 68, 'feeding', 15.0, 0.10, 'Normal'],
    ['C-009', 'Nala', 'Limousin', 4, 620.00, 'healthy', 'Paddock A', 38.6, 63, 'grazing', 21.0, 0.06, 'Normal'],
    ['C-010', 'Zoe', 'Charolais', 6, 750.00, 'sick', 'Barn 1', 39.5, 78, 'resting', 12.5, 0.78, 'Low Appetite']
];

const seed = async () => {
    try {
        console.log('Seeding database...');
        
        // Clear existing data
        await pool.query('DELETE FROM milk_records');
        await pool.query('DELETE FROM cattle');
        
        // Seed Cattle
        const cattleInsertQuery = `
            INSERT INTO cattle 
            (tagId, name, breed, age, weight, healthStatus, location, temperature, heartRate, activity, milkProduction, aiHealthRisk, aiBehaviorPattern) 
            VALUES ?`;
        await pool.query(cattleInsertQuery, [cattleData]);
        
        // Get inserted cattle IDs
        const [rows] = await pool.query('SELECT id, tagId FROM cattle');
        
        // Seed Milk Records
        const milkData = rows.map(cattle => {
            const quantity = (Math.random() * 20 + 5).toFixed(2);
            const qualities = ['excellent', 'good', 'fair', 'poor'];
            const quality = qualities[Math.floor(Math.random() * qualities.length)];
            const temp = (Math.random() * 2 + 37).toFixed(2);
            return [cattle.id, cattle.tagId, quantity, quality, temp, 'Main Parlor'];
        });

        const milkInsertQuery = `
            INSERT INTO milk_records 
            (cattleId, tagId, quantity, quality, temperature, location) 
            VALUES ?`;
        await pool.query(milkInsertQuery, [milkData]);

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
};

seed();
