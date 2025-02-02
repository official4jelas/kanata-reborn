import { createSticker, StickerTypes } from "wa-sticker-formatter";
import { uploadGambar2 } from '../../helper/uploader.js'
import { streamToBuffer } from "../../helper/mediaMsg.js";

export const handler = "smeme"
export const description = "Sticker Meme maker";
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {

    if (Buffer.isBuffer(attf)) {
        const stickerOption = {
            pack: "Kanata",
            author: "KanataBot",
            type: StickerTypes.FULL,
            quality: 100
        }

        try {
            const imageUrl = await uploadGambar2(attf)
            const text = psn.split('.')
            const url = `https://skizoasia.xyz/api/memegen?apikey=yatanonagami&url=${imageUrl}&text=${text[0]}&text2=${text[1] || ''}`
            const { body } = await fetch(url)
            const generateSticker = await createSticker(await streamToBuffer(body), stickerOption);
            await sock.sendMessage(id, { sticker: generateSticker }, { quoted: m });
        } catch (error) {
            console.log('Error creating sticker:', error);
            await sock.sendMessage(id, { text: `Error creating sticker\n Reason :\n ${error}` });
        }

        return
    }
    // else {
    //   console.log('Media data not found');
    if (!m.message?.conversation && !m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
        return
    };
    //   await sock.sendMessage(id, { text: 'Kirim/reply gambar dengan caption s' });
    // }
    await sock.sendMessage(id, { text: 'Kirim/reply gambar dengan caption smeme text1.tex2 (text2 bersifat opsional)' });
};
