import pkg from '@seaavey/baileys'
import { ytsearch } from '../../lib/youtube.js';
const { proto, generateWAMessageFromContent, prepareWAMessageMedia } = pkg
export const handler = 'yts'
export const description = 'Youtube Search Versi terbaru'
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    sock.sendMessage(id, { react: { text: '⏱️', key: m.key } })
    const hasilPencarian = await ytsearch(psn);
    const cards = await Promise.all(hasilPencarian.map(async (result) => ({
        body: proto.Message.InteractiveMessage.Body.fromObject({
            text: `*${result.url}*`
        }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({
            text: ` © Copyright By ${result.author}`
        }),
        header: proto.Message.InteractiveMessage.Header.fromObject({
            title: `*${result.title}*`,
            hasMediaAttachment: true, ...(await prepareWAMessageMedia({ image: { url: result.image } }, { upload: sock.waUploadToServer }))
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
            buttons: [
                {
                    name: "quick_reply",
                    buttonParamsJson: `{"display_text":"📽️ Download Video","id":"yd ${result.url}"}`
                },
                {
                    name: "quick_reply",
                    buttonParamsJson: `{"display_text":"🎵 Download Audio","id":"ymd ${result.url}"}`
                }
            ]
        })
    })))
    const msge = generateWAMessageFromContent(id, {
        viewOnceMessage: {
            message: {
                messageContextInfo: {
                    deviceListMetadata: {},
                    deviceListMetadataVersion: 2
                },
                interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                    contextInfo: {
                        // mentionedJid: [m.sender],
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363305152329358@newsletter',
                            newsletterName: 'Powered By : Roy',
                            serverMessageId: -1
                        },
                        // businessMessageForwardInfo: { businessOwnerJid: sock.decodeJid(sock.user.id) },
                        forwardingScore: 256,
                        externalAdReply: {
                            title: 'Roidev',
                            thumbnailUrl: 'https://telegra.ph/file/a6f3ef42e42efcf542950.jpg',
                            sourceUrl: 'https://whatsapp.com/channel/0029ValMR7jDp2Q7ldcaNK1L',
                            mediaType: 2,
                            renderLargerThumbnail: false
                        }
                    },
                    body: proto.Message.InteractiveMessage.Body.fromObject({
                        text: `*[Youtube Search Result]*`
                    }),
                    footer: proto.Message.InteractiveMessage.Footer.fromObject({
                        text: ' © Copyright By KanataV2'
                    }),
                    header: proto.Message.InteractiveMessage.Header.fromObject({
                        hasMediaAttachment: false
                    }),
                    carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
                        cards
                    })
                })
            }
        }
    }, { id: m.chat, quoted: m })
    // console.log("Objek Msg", msg.message.viewOnceMessage.message.interactiveMessage.carouselMessage.cards)
    // console.log("Objek Msge", msge.message.viewOnceMessage.message.interactiveMessage.carouselMessage.cards)
    // sock.relayMessage(id, msg.message, { messageId: msg.key.id })
    await sock.relayMessage(id, msge.message, { messageId: msge.key.id })
    await sock.sendMessage(id, { react: { text: '✅', key: m.key } })

};
