export default async ({ sock, m, id, noTel, psn }) => {
    try {
        if (!psn) {
            await sock.sendMessage(id, { 
                text: `❌ Format salah!\n\nCara penggunaan:\n!confess pesan\n\nContoh:\n!confess Aku suka makan indomie 5 bungkus sehari` 
            });
            return;
        }

        // Simpan confess ke database
        await new Promise((resolve, reject) => {
            db.run(`INSERT INTO messages (type, sender_id, message, is_anonymous) 
                VALUES (?, ?, ?, ?)`,
                ['confess', noTel, psn, 1],
                (err) => {
                    if (err) reject(err);
                    resolve();
                }
            );
        });

        // Ambil ID confess yang baru dibuat
        const confessId = await new Promise((resolve, reject) => {
            db.get('SELECT last_insert_rowid() as id', (err, row) => {
                if (err) reject(err);
                resolve(row.id);
            });
        });

        // Kirim ke grup confess (jika ada)
        const confessGroup = process.env.CONFESS_GROUP_ID;
        if (confessGroup) {
            await sock.sendMessage(confessGroup, { 
                text: `*🗣️ CONFESS #${confessId}*\n\n${psn}\n\n_Gunakan !react ${confessId} <emoji> untuk bereaksi_` 
            });
        }

        // Konfirmasi ke pengirim
        await sock.sendMessage(id, { 
            text: '✅ Confess berhasil dikirim!' 
        });

    } catch (error) {
        await sock.sendMessage(id, { 
            text: `❌ Error: ${error.message}` 
        });
    }
};

export const handler = 'confess';
export const tags = ['fun'];
export const command = ['confess', 'pengakuan'];
export const help = 'Kirim pengakuan secara anonim\nPenggunaan: !confess pesan'; 