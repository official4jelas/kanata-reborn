import axios from "axios";
import { uploadGambar2 } from "../../helper/uploader.js";

export const description = "📤 *Image Analyzer* 📤";
export const handler = ['jelasin','tulis','kanata','gambar','bacakan','bacain','kerjain','kerjakan', 'jelaskan', `terjemahkan`, 'mangsud', 'maksud']
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {


  if (Buffer.isBuffer(attf)) {
    sock.sendMessage(id, { react: { text: '⏱️', key: m.key } })
    try {
      // Pesan sukses upload gambar
      const imageUrl = await uploadGambar2(attf);
      const { data } = await axios.get('https://fastrestapis.fasturl.cloud/aillm/gpt-4o', {
        params: {
          ask: psn,
          imageUrl,
          style: 'Selalu balas percakapan user dalam bahasa indonesia',
          sessionId: id

        }
      })
      await sock.sendMessage(id, {
        text: data.result,
      }, { quoted: m });
      await sock.sendMessage(id, { react: { text: '✅', key: m.key } })
    } catch (error) {
      // Pesan error
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
