import { uploadGambar2 } from "../../helper/uploader.js";
// import Button from "../../lib/button.js";

export const description = "📤 *Upload Image* 📤";
export const handler = ['tourl', "upload"]
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {

    if (Buffer.isBuffer(attf)) {
        try {
            // Pesan sukses upload gambar
            const linkGambar = await uploadGambar2(attf);
            const text = `✅ *Upload Berhasil!* ✅\n\n🖼️ *Link Gambar*: ${linkGambar}\n\nTerima kasih, gambar sudah berhasil diunggah! 🎉`
            await sock.sendMessage(id, {
                caption: text,
                image: {
                    url: linkGambar,
                },
                contextInfo: {
                    isForwarded: true,
                    serverMessageId: -1,
                    forwardingScore: 256,
                    externalAdReply: {
                        showAdAttribution: true,
                        title: 'Upload/Tourl Berhasil',
                        body: m.pushName || sender,
                        mediaType: 1,
                        thumbnailUrl: 'https://telegra.ph/file/8360caca1efd0f697d122.jpg',
                        sourceUrl: 'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                        mediaType: 1,
                        renderLargerThumbnail: false
                    },
                }
            }, {

                quoted: m
            });
        } catch (error) {
            // Pesan error
            console.log('❌ Error creating gambar:', error);
            await sock.sendMessage(id, {
                text: `⚠️ *Terjadi Kesalahan saat upload gambar!* ⚠️\n\n🚨 *Alasan*: ${error.message}\nSilakan coba lagi nanti.`,
            });
        }
        return;
    }

    // Cek nek ora nana gambar sing dilampirkan
    if (!m.message?.conversation && !m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
        return;
    }
    await sock.sendMessage(id, {
        text: `⚠️ *Tidak ada gambar yang ditemukan!* ⚠️\n\n📥 *Cara penggunaan*: Kirim atau balas gambar nganggo caption *upload*.`,
    });
};
