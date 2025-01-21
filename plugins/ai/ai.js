import { gptNeo4 } from "../../lib/ai.js";

// Metadata deskripsi perintah
export const description = "🤖 *AI GPT 3.5* disediakan oleh *SkizoTech*";
export const handler = "ai"
export default async ({ sock, m, id, psn, sender, noTel, caption }) => {
    if (psn.trim() === '') {
        sock.sendMessage(id, {
            text: "🤖 *AI GPT-3.5* Siap Membantu!\n\nGunakan prefix *ai* untuk bertanya apa saja ke AI.\nContoh: _*ai siapa presiden Indonesia saat ini?*_\n\n📝 *Ajukan pertanyaanmu dan biarkan AI memberikan jawabannya!*",
            ai: true
        });
        return;
    }

    try {
        // Menampilkan respons AI yang diambil dari gptSkizo
        const response = await gptNeo4(psn);
        await sock.sendMessage(id, { text: `🤖 *Jawaban dari AI*:\n\n${response}` });
        // await sock.sendMessage(id, { text: `AI-nya lagi mantenan guys,belum bisa dipake,xD` });
    } catch (error) {
        // Penanganan kesalahan dengan emoji
        await sock.sendMessage(id, { text: `⚠️ *Terjadi kesalahan*:\n${error.message}` });
    }
};
