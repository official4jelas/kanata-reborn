import { threads } from "../../lib/downloader.js";
export const description = "Downloader Threads Video provided by *Roidev*";
export const handler = "threads"
export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    if (psn === '') {
        await sock.sendMessage(id, {
            text: '📹 *Gunakan format:* \n\n`threads <url video>` '
        });
        return;
    }
    try {
        await sock.sendMessage(id, { text: '🔄 *Processing...* Mohon tunggu sebentar...' });
        let result = await threads(psn);
        await sock.sendMessage(id, { video: { url: result }, caption: '🎥 *Video berhasil diunduh!*' });

    } catch (error) {
        await sock.sendMessage(id, { text: '❌ *Ups,Terjadi kesalahan:* \n' + error.message });
    }
};
