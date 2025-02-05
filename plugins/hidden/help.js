import { helpMessage } from '../../helper/help.js'
import { getBuffer } from '../../helper/mediaMsg.js';
export const handler = ["menu", "help", "h", "hai"]
export const description = "List All Menu";
export default async ({ sock, id, m, noTel, sender }) => {
    const { caption, plugins } = await helpMessage()
    let sections = []
    for (const plugin in plugins) {
        sections.push({
            header: 'Daftar Menu Kanata V2',
            highlight_label: 'V2',
            title: `❏┄┅━┅┄〈 〘 ${plugin.toUpperCase()} 〙`,
            rows: plugins[plugin].map((command) => {
                return {
                    title: Array.isArray(command.handler)
                        ? command.handler.map(h => h.toUpperCase()).join(', ')
                        : command.handler.toUpperCase(),
                    description: command.description,
                    id: `${command.handler}`
                }
            })
        })
    }
    await sock.sendMessage(id, {
        caption,
        thumbnail: await getBuffer('https://telegra.ph/file/8360caca1efd0f697d122.jpg'),
        image: {
            url: await loadAssets('kanata-cover.jpeg', 'image'),
        },
        buttons: [
            {
                buttonId: 'ping',
                buttonText: {
                    displayText: 'Test Ping'
                },
                type: 4,
                nativeFlowInfo: {
                    name: 'single_select',
                    paramsJson: JSON.stringify({
                        title: 'Daftar Menu Kanata V2',
                        sections
                    }),
                },
            },
            {
                buttonId: 'owner',
                buttonText: {
                    displayText: 'Owner Contact'
                },
                type: 1,
            }
        ],
        footer: 'KANATA V2',
        headerType: 1,
        viewOnce: true,
        contextInfo: {
            mentionedJid: [...sender],
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: globalThis.newsLetterJid,
                newsletterName: 'Powered By : Roy',
                serverMessageId: -1
            },
            forwardingScore: 999,
            externalAdReply: {
                title: 'Kanata-V2',
                thumbnailUrl: 'https://telegra.ph/file/8360caca1efd0f697d122.jpg',
                sourceUrl:'https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m',
                mediaType: 2,
                renderLargerThumbnail: false
            }
        },
    }, {
        quoted: {
            key: {
                remoteJid: 'status@broadcast',
                participant: '0@s.whatsapp.net'
            },
            message: {
                newsletterAdminInviteMessage: {
                    newsletterJid: '120363293401077915@newsletter',
                    newsletterName: 'Roidev',
                    caption: 'Kanata'
                }
            }
        }
    })
}