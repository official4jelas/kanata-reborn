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

        // Tabel RPG Stats
        db.run(`CREATE TABLE IF NOT EXISTS rpg_stats (
            user_id TEXT PRIMARY KEY,
            health INTEGER DEFAULT 100,
            max_health INTEGER DEFAULT 100,
            mana INTEGER DEFAULT 50,
            max_mana INTEGER DEFAULT 50,
            strength INTEGER DEFAULT 10,
            defense INTEGER DEFAULT 10,
            agility INTEGER DEFAULT 10,
            intelligence INTEGER DEFAULT 10,
            gold INTEGER DEFAULT 0,
            last_hunt DATETIME,
            last_heal DATETIME
        )`);

        // Tabel Inventory
        db.run(`CREATE TABLE IF NOT EXISTS inventory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            item_id INTEGER,
            quantity INTEGER DEFAULT 1,
            FOREIGN KEY (user_id) REFERENCES rpg_stats (user_id),
            FOREIGN KEY (item_id) REFERENCES items (id)
        )`);

        // Tabel Items
        db.run(`CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            type TEXT,
            rarity TEXT,
            price INTEGER,
            effect TEXT,
            description TEXT
        )`);

        // Update RPG Stats dengan stats tambahan
        db.run(`ALTER TABLE rpg_stats ADD COLUMN IF NOT EXISTS hunger INTEGER DEFAULT 100`);
        db.run(`ALTER TABLE rpg_stats ADD COLUMN IF NOT EXISTS thirst INTEGER DEFAULT 100`);
        db.run(`ALTER TABLE rpg_stats ADD COLUMN IF NOT EXISTS energy INTEGER DEFAULT 100`);
        db.run(`ALTER TABLE rpg_stats ADD COLUMN IF NOT EXISTS last_scavenge DATETIME`);
        db.run(`ALTER TABLE rpg_stats ADD COLUMN IF NOT EXISTS last_steal DATETIME`);
        db.run(`ALTER TABLE rpg_stats ADD COLUMN IF NOT EXISTS jail_time DATETIME`);

        // Tabel untuk AFK
        db.run(`CREATE TABLE IF NOT EXISTS afk_status (
            user_id TEXT PRIMARY KEY,
            reason TEXT,
            start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
            mentioned_by TEXT,
            FOREIGN KEY (user_id) REFERENCES users (phone)
        )`);

        // Tabel untuk pengaturan grup
        db.run(`CREATE TABLE IF NOT EXISTS group_settings (
            group_id TEXT PRIMARY KEY,
            antilink BOOLEAN DEFAULT false,
            welcome BOOLEAN DEFAULT true,
            goodbye BOOLEAN DEFAULT true,
            antispam BOOLEAN DEFAULT false,
            antitoxic BOOLEAN DEFAULT false,
            only_admin BOOLEAN DEFAULT false,
            welcome_message TEXT,
            goodbye_message TEXT
        )`);

        // Tabel untuk spam detection
        db.run(`CREATE TABLE IF NOT EXISTS spam_detection (
            user_id TEXT,
            group_id TEXT,
            message_count INTEGER DEFAULT 0,
            last_message DATETIME,
            warning_count INTEGER DEFAULT 0,
            PRIMARY KEY (user_id, group_id)
        )`);

        // Tabel untuk jadibot sessions
        db.run(`CREATE TABLE IF NOT EXISTS jadibot_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            session_id TEXT UNIQUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            expires_at DATETIME,
            is_active BOOLEAN DEFAULT true
        )`);

        // Tabel untuk sewa bot
        db.run(`CREATE TABLE IF NOT EXISTS bot_rentals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            group_id TEXT UNIQUE,
            renter_id TEXT,
            plan_type TEXT,
            start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            end_date DATETIME,
            is_active BOOLEAN DEFAULT true,
            payment_status TEXT DEFAULT 'pending'
        )`);

        // Tabel untuk harga sewa
        db.run(`CREATE TABLE IF NOT EXISTS rental_plans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            plan_name TEXT UNIQUE,
            duration_days INTEGER,
            price INTEGER,
            features TEXT
        )`);

        // Insert default rental plans
        db.run(`INSERT OR IGNORE INTO rental_plans (plan_name, duration_days, price, features) VALUES 
            ('Basic', 30, 10000, '["antilink", "welcome", "antispam"]'),
            ('Premium', 30, 25000, '["antilink", "welcome", "antispam", "antitoxic", "games"]'),
            ('Permanent', 999999, 100000, '["all features"]')`);
    });

    // Tambah items baru
    const newItems = [
        ['Nasi', 'food', 'common', 50, '{"hunger": 30, "energy": 10}', 'Nasi putih yang mengenyangkan'],
        ['Air Mineral', 'drink', 'common', 20, '{"thirst": 30, "energy": 5}', 'Air mineral segar'],
        ['Roti', 'food', 'common', 30, '{"hunger": 20, "energy": 8}', 'Roti tawar'],
        ['Kopi', 'drink', 'common', 40, '{"thirst": 20, "energy": 15}', 'Kopi hitam'],
        ['Lockpick', 'tool', 'rare', 1000, '{"steal_bonus": 10}', 'Alat untuk mencuri'],
        ['Sarung Tangan', 'tool', 'common', 500, '{"scavenge_bonus": 5}', 'Sarung tangan untuk memulung']
    ];

    db.get('SELECT COUNT(*) as count FROM items WHERE type IN ("food", "drink", "tool")', [], (err, row) => {
        if (err) {
            console.error('Error checking items:', err);
            return;
        }

        if (row.count === 0) {
            const stmt = db.prepare('INSERT INTO items (name, type, rarity, price, effect, description) VALUES (?, ?, ?, ?, ?, ?)');
            newItems.forEach(item => stmt.run(item));
            stmt.finalize();
        }
    });
}

export default db; 