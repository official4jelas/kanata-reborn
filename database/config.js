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
    try {
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
            // tabel menfess
            db.run(`CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT NOT NULL,
                sender_id TEXT NOT NULL,
                receiver_id TEXT DEFAULT 0,
                message TEXT NOT NULL,
                is_anonymous INTEGER DEFAULT 0,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
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
            db.run(`DROP TABLE IF EXISTS sessions`);
            db.run(`CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT UNIQUE,
                session_data TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
                last_heal DATETIME,
                hunger INTEGER DEFAULT 100,
                thirst INTEGER DEFAULT 100,
                energy INTEGER DEFAULT 100,
                last_scavenge DATETIME,
                last_steal DATETIME,
                jail_time DATETIME
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
            db.run(`INSERT OR REPLACE INTO rental_plans (plan_name, duration_days, price, features) VALUES 
                ('Basic', 30, 10000, '["antilink", "welcome", "antispam"]'),
                ('Premium', 30, 25000, '["antilink", "welcome", "antispam", "antitoxic", "games"]'),
                ('Permanent', 999999, 100000, '["all features"]')`);

            // Tabel untuk dungeon/boss
            db.run(`CREATE TABLE IF NOT EXISTS dungeons (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE,
                min_level INTEGER,
                hp INTEGER,
                attack INTEGER,
                defense INTEGER,
                exp_reward INTEGER,
                gold_reward INTEGER,
                item_drops TEXT,
                cooldown_minutes INTEGER
            )`);

            // Tabel untuk skill
            db.run(`CREATE TABLE IF NOT EXISTS skills (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE,
                type TEXT,
                effect TEXT,
                mana_cost INTEGER,
                cooldown_seconds INTEGER,
                min_level INTEGER,
                price INTEGER
            )`);

            // Tabel user skills
            db.run(`CREATE TABLE IF NOT EXISTS user_skills (
                user_id TEXT,
                skill_id INTEGER,
                last_used DATETIME,
                FOREIGN KEY(user_id) REFERENCES rpg_stats(user_id),
                FOREIGN KEY(skill_id) REFERENCES skills(id),
                PRIMARY KEY(user_id, skill_id)
            )`);

            // Tabel untuk quest
            db.run(`CREATE TABLE IF NOT EXISTS quests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE,
                description TEXT,
                type TEXT,
                target_amount INTEGER,
                exp_reward INTEGER,
                gold_reward INTEGER,
                item_reward TEXT,
                min_level INTEGER
            )`);

            // Tabel user quests
            db.run(`CREATE TABLE IF NOT EXISTS user_quests (
                user_id TEXT,
                quest_id INTEGER,
                progress INTEGER DEFAULT 0,
                completed BOOLEAN DEFAULT 0,
                FOREIGN KEY(user_id) REFERENCES rpg_stats(user_id),
                FOREIGN KEY(quest_id) REFERENCES quests(id),
                PRIMARY KEY(user_id, quest_id)
            )`);

            // Insert default dungeons
            db.run(`INSERT OR REPLACE INTO dungeons 
                (name, min_level, hp, attack, defense, exp_reward, gold_reward, item_drops, cooldown_minutes) VALUES 
                ('Goblin Cave', 5, 500, 50, 30, 1000, 500, '{"Goblin Sword": 0.3, "Health Potion": 0.5}', 30),
                ('Dragon Lair', 15, 2000, 150, 100, 5000, 2000, '{"Dragon Scale": 0.2, "Rare Sword": 0.1}', 60),
                ('Demon Castle', 30, 5000, 300, 200, 10000, 5000, '{"Demon Crown": 0.05, "Legendary Armor": 0.08}', 120)`
            );

            // Insert default skills
            db.run(`INSERT OR REPLACE INTO skills 
                (name, type, effect, mana_cost, cooldown_seconds, min_level, price) VALUES 
                ('Heal', 'support', '{"health": 100}', 30, 60, 1, 1000),
                ('Fireball', 'attack', '{"damage": 150}', 50, 30, 5, 2000),
                ('Shield', 'defense', '{"defense": 50}', 40, 90, 3, 1500),
                ('Ultimate Attack', 'attack', '{"damage": 300}', 100, 180, 10, 5000)`
            );

            // Insert default quests
            db.run(`INSERT OR REPLACE INTO quests 
                (name, description, type, target_amount, exp_reward, gold_reward, item_reward, min_level) VALUES 
                ('Beginner Hunter', 'Hunt 5 times', 'hunt', 5, 500, 300, '{"Health Potion": 2}', 1),
                ('Master Scavenger', 'Mulung 10 times', 'mulung', 10, 800, 500, '{"Lucky Charm": 1}', 3),
                ('Dungeon Explorer', 'Complete 3 dungeons', 'dungeon', 3, 2000, 1000, '{"Rare Weapon": 1}', 5)`
            );
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

    } catch (error) {
        console.error('Error initializing tables:', error);
    }
}

// Fungsi untuk membersihkan sessions yang tidak valid
export const cleanSessions = () => {
    return new Promise((resolve, reject) => {
        try {
            db.run(`DELETE FROM sessions WHERE session_data IS NULL`, [], (err) => {
                if (err) reject(err);
                resolve();
            });
        } catch (error) {
            reject(error);
        }
    });
};

// Update fungsi untuk menyimpan session
export const saveSession = (sessionId, sessionData) => {
    return new Promise((resolve, reject) => {
        db.run(`INSERT OR REPLACE INTO sessions (session_id, session_data) VALUES (?, ?)`,
            [sessionId, JSON.stringify(sessionData)],
            (err) => {
                if (err) reject(err);
                resolve();
            });
    });
};

// Fungsi untuk mendapatkan session
export const getSession = (sessionId) => {
    return new Promise((resolve, reject) => {
        db.get(`SELECT session_data FROM sessions WHERE session_id = ?`,
            [sessionId],
            (err, row) => {
                if (err) reject(err);
                resolve(row ? JSON.parse(row.session_data) : null);
            });
    });
};

export default db;