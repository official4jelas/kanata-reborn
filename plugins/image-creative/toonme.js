import { beta } from "../../helper/betabotz.js";
import { uploadGambar2 } from "../../helper/uploader.js";
export const handler = "jadianime"
export const description = "✨ Berikan gambarmu untuk dirubah jadi Anime 📸";
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    if (Buffer.isBuffer(attf)) {
        await sock.sendMessage(id, { text: `⏱️ tunggu bentar,Gambarmu lagi diproses` });
        try {
            const imageUrl = await uploadGambar2(attf);
            const response = await beta('maker/jadianime', {
                params: {
                    url: imageUrl
                }
            })
            console.log(response.data.result)
            return
            await sock.sendMessage(id, {
                image: { url: response.result.img_crop_single },
                caption: '📷 Anjay, udah jadi nih! 🎉'
            }, { quoted: m });

        } catch (error) {
            console.log(error)
            // Penanganan kesalahan dengan pesan lebih informatif
            await sock.sendMessage(id, { text: `⚠️ Terjadi kesalahan saat memproses gambar. Coba lagi nanti ya!\n\nError: ${error.message}` });
        }
        return;
    }

    // Cek jika tidak ada gambar yang dikirim atau tidak dalam format yang benar
    if (!m.message?.conversation && !m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
        return
    }
    await sock.sendMessage(id, { text: 'Kirim atau balas gambar dengan caption *jadianime* untuk mengonversi gambar menjadi Kartun.' });
};
