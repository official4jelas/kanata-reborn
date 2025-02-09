import sqlite3 from 'sqlite3';
import pkg from 'sqlite3';
const { open } = pkg;
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'kanata.db');

// Buat koneksi database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to SQLite database');
        initializeTables();
    }
});

// Inisialisasi tabel-tabel
function initializeTables() {
    db.serialize(() => {
        // Tabel users
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phone TEXT UNIQUE,
            name TEXT,
            is_admin BOOLEAN DEFAULT 0,
            exp INTEGER DEFAULT 0,
            level INTEGER DEFAULT 1,
            last_daily DATETIME,
            total_messages INTEGER DEFAULT 0,
            total_commands INTEGER DEFAULT 0,
            join_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Tabel plugins
        db.run(`CREATE TABLE IF NOT EXISTS plugins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE,
            path TEXT,
            is_active BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Tabel sessions
        db.run(`CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT UNIQUE,
            phone TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_active DATETIME
        )`);

        // Tabel commands
        db.run(`CREATE TABLE IF NOT EXISTS commands (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            command TEXT UNIQUE,
            plugin_id INTEGER,
            description TEXT,
            is_active BOOLEAN DEFAULT 1,
            FOREIGN KEY (plugin_id) REFERENCES plugins (id)
        )`);
    });
}

export default db; 