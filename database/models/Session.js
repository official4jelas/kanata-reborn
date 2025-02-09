import db from '../config.js';

class Session {
    static async create(sessionId, phone) {
        return new Promise((resolve, reject) => {
            db.run('INSERT INTO sessions (session_id, phone) VALUES (?, ?)',
                [sessionId, phone],
                function(err) {
                    if (err) reject(err);
                    resolve(this.lastID);
                });
        });
    }

    static async updateLastActive(sessionId) {
        return new Promise((resolve, reject) => {
            db.run('UPDATE sessions SET last_active = CURRENT_TIMESTAMP WHERE session_id = ?',
                [sessionId],
                (err) => {
                    if (err) reject(err);
                    resolve();
                });
        });
    }

    static async getActive() {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM sessions WHERE last_active > datetime("now", "-1 hour")',
                [],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                });
        });
    }
}

export default Session; 