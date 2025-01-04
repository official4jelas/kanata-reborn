import { snack } from "../../lib/downloader.js";
export const description = "Downloader SnackVideo provided by *BetaBotz*";
export const handler = "snack"
export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    if (psn === '') {
        await sock.sendMessage(id, {
            text: "🎬 *Gunakan format:* \n\n`snack <url>`\n\nContoh:\n`snack https://s.snackvideo.com/p/j9jKr9dR`"
        });
        return;
    }
    try {
        await sock.sendMessage(id, { text: '🔄 *Processing...* Mohon tunggu sebentar...' });
        let result = await snack(psn);
        await sock.sendMessage(id, {
            video: { url: result.video },
            caption: `📹 *Download Video berhasil !*\n\n📄 *Title:* ${result.title}\n Author : ${result.author}`
        });

    } catch (error) {
        await sock.sendMessage(id, { text: '❌ *Ups, Terjadi kesalahan:* \n' + error.message });
    }
};
