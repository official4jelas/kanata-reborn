import { uploadGambar2 } from "../../helper/uploader.js";

export const description = "📤 *Image Analyzer* 📤";
export const handler = ['jelasin', 'jelaskan', 'deskripsikan', 'mangsud', 'maksud']
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {

  if (Buffer.isBuffer(attf)) {
    try {
      // Pesan sukses upload gambar
      const linkGambar = await uploadGambar2(attf);
      await sock.sendMessage(id, {
        text: ``,
      }, { quoted: m });
    } catch (error) {
      // Pesan error
      console.log('❌ Error creating gambar:', error);
      await sock.sendMessage(id, {
        text: `⚠️ *Terjadi Kesalahan saat upload gambar!* ⚠️\n\n🚨 *Alasan*: ${error.message}\nSilakan coba lagi nanti.`,
      });
    }
    return;
  }

  // Cek kalo ora ana gambar sing dilampirake
  if (!m.message?.conversation && !m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
    return;
  }
  return
};
