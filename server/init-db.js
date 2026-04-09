const pool = require('./config/database');
const fs = require('fs');
const path = require('path');

async function initDB() {
    try {
        console.log('Initializing database schema...');
        const sqlPath = path.join(__dirname, 'database', 'schema.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Split by semicolon but ignore semicolons inside ENUM or VARCHAR
        // A simple split is often enough for standard schemas
        const queries = sql
            .split(';')
            .map(q => q.trim())
            .filter(q => q.length > 0);

        for (let query of queries) {
            // Skip USE and CREATE DATABASE as most cloud DBs don't allow it
            if (query.toUpperCase().startsWith('CREATE DATABASE') || query.toUpperCase().startsWith('USE')) {
                console.log(`Skipping: ${query.substring(0, 30)}...`);
                continue;
            }
            console.log(`Executing: ${query.substring(0, 50)}...`);
            await pool.query(query);
        }

        console.log('Database schema initialized successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error initializing database:', err);
        process.exit(1);
    }
}

initDB();
