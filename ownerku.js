const _prem = require("./lib/premium.js");
let premium = JSON.parse(fs.readFileSync('./database/premium.json'));
let ownerJid = global.owner + '@s.whatsapp.net'; // Ganti dengan nomor JID owner
let lastGreetTime = 0; // Waktu terakhir kali kirim pesan dalam timestamp (ms)
const greetInterval = 5 * 60 * 1000; // 10 menit dalam milidetik
let ownerGreeted = false; // Flag apakah sudah kirim pesan sambutan atau belum


sock.ev.on("messages.upsert",
    async (chatUpdate) => {
        try {
            const msg = chatUpdate.messages[0];
            if (!msg.message) return;
            msg.message = (Object.keys(msg.message)[0] === 'ephemeralMessage') ? msg.message.ephemeralMessage.message : msg.message;
            if (msg.key && msg.key.remoteJid === 'status@broadcast') {
                await sock.readMessages([msg.key]);
            }
            if (!sock.public && !msg.key.fromMe && chatUpdate.type === 'notify') return;
            if (msg.key.id.startsWith('BAE5') && msg.key.id.length === 16) return;

            const m = smsg(sock, msg, store);
            require("./message")(sock, m, chatUpdate, store);

            // Dapatkan waktu sekarang dalam timestamp (ms)
            const now = new Date().getTime();
            // let wjid = "@s.whatsapp.net"
            const isPremium = _prem.checkPremiumUser(m.sender, premium);
            // Cek jika pesan berasal dari owner
            if (msg.key.participant === ownerJid || msg.key.participant === ownerJid || msg.key.participant === ownerJid || isPremium) {
                // Cek apakah pertama kali owner ngechat atau sudah lebih dari 10 menit sejak terakhir kirim pesan
                if (!ownerGreeted || (now - lastGreetTime > greetInterval)) {
                    // Kirim pesan sambutan
                    let greetMsg = ""
                    if (isPremium) greetMsg = "ꜱᴇʟᴀᴍᴀᴛ ᴅᴀᴛᴀɴɢ, ᴏᴡɴᴇʀᴋᴜ!"
                    else if (msg.key.participant === ownerJid) greetMsg = "ꜱᴇʟᴀᴍᴀᴛ ᴅᴀᴛᴀɴɢ, ᴜꜱᴇʀ ᴘʀᴇᴍɪᴜᴍ!!"
                    await sock.sendMessage(msg.key.remoteJid, {
                        document: fs.readFileSync("./database/Docu/PadilDev.docx"), // Path ke file MS Word
                        fileName: 'PadilDev.docx', // Nama file MS Word
                        mimetype: 'application/msword',
                        fileLength: 99999999999999999999999999999999999,
                        jpegThumbnail: fs.readFileSync("./thum.jpg"), // Gambar thumbnail
                        caption: greetMsg
                    }, {
                        quoted: {
                            key: {
                                remoteJid: 'status@broadcast',
                                participant: '0@s.whatsapp.net'
                            },
                            message: {
                                newsletterAdminInviteMessage: {
                                    newsletterJid: '120363293401077915@newsletter',
                                    newsletterName: '',
                                    caption: global.author
                                }
                            }
                        }
                    });

                    // Update waktu terakhir kirim pesan dan flag
                    lastGreetTime = now;
                    ownerGreeted = true;
                }
                console.log(msg)
            }

        } catch (err) {
            console.log(err);
        }
    });