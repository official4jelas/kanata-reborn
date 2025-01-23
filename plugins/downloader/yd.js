import { yutubVideo } from "../../lib/downloader.js";
export const description = "YouTube Video Downloader provided by *Roidev*";
export const handler = "yd"
export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    if (psn === '') {
        await sock.sendMessage(id, { 
            text: '📹 *Gunakan format:* \n\n`yd <url>`\n\nContoh:\n`yd https://www.youtube.com/watch?v=Ww4Ua`' 
        });
        return;
    }
    try {
        await sock.sendMessage(id, { text: '🔄 *Processing...* Mohon tunggu sebentar...' });
        let {video} = await yutubVideo(psn);
        // caption = '*🎬 Hasil Video YouTube:*'
        // caption += '\n📛 *Title:* ' + `*${result.title}*`;
        // caption += '\n📺 *Channel:* ' + `*${result.channel}*`;
        await sock.sendMessage(id, { video: { url: video } });
    } catch (error) {
        await sock.sendMessage(id, { text: '❌ *Terjadi kesalahan:* \n' + error.message });
    }
};
