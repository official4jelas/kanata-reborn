import { createServer } from 'node:http'
import express from 'express'
import { dirname, join } from 'node:path'
import { Server } from 'socket.io'
import './global.js'
import { Kanata, clearMessages } from './helper/bot.js';
import { groupParticipants, groupUpdate } from './lib/group.js';
import { checkAnswer, tebakSession } from './lib/tebak/index.js';
import { getMedia } from './helper/mediaMsg.js';
import { fileURLToPath, pathToFileURL } from 'url';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import readline from 'readline';
import { call } from './lib/call.js';
import OpenAI from "openai";

globalThis.openai = new OpenAI({ apiKey: globalThis.apiKey.llama, baseURL: 'https://api.llama-api.com' });

const app = express()
const server = createServer(app)
globalThis.io = new Server(server)

const _dirname = dirname(fileURLToPath(import.meta.url))
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fungsi untuk mencari semua file .js secara rekursif
function findJsFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        // Jika itu folder, lakukan rekursi
        if (stat && stat.isDirectory()) {
            results = results.concat(findJsFiles(filePath));
        }
        // Jika itu file .js, tambahkan ke results
        else if (file.endsWith('.js')) {
            results.push(filePath);
        }
    });
    return results;
}

app.get('/', (req, res) => {
    res.sendFile(join(_dirname, 'index.html'))
})



async function getPhoneNumber(notelp) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const namaSesiPath = path.join(__dirname, globalThis.sessionName);

    try {
        await fs.promises.access(namaSesiPath);
        return null
    } catch {
        const validatePhoneNumber = (notelp) => {
            const phoneRegex = /^62\d{9,15}$/; // Nomor harus mulai dengan '62' dan minimal 10 digit
            return phoneRegex.test(notelp);
        };

        if (validatePhoneNumber(notelp)) {
            return notelp;
        } else {
            throw new Error("Nomor telepon tidak valid! Pastikan dimulai dengan '62' dan hanya berisi angka.");
        }
    }
}

async function prosesPerintah({ command, sock, m, id, sender, noTel, attf }) {
    if (!command) return;
    let [cmd, ...args] = "";
    [cmd, ...args] = command.split(' ');
    cmd = cmd.toLowerCase();
    if (command.startsWith('!')) {
        cmd = command.toLowerCase().substring(1).split(' ')[0];
        args = command.split(' ').slice(1)
    }
    console.log("cmd:", cmd)
    console.log(args)
    // console.log(cmd)
    const pluginsDir = path.join(__dirname, 'plugins');
    const plugins = Object.fromEntries(
        await Promise.all(findJsFiles(pluginsDir).map(async file => {
            const { default: plugin, handler } = await import(pathToFileURL(file).href);
            if (Array.isArray(handler) && handler.includes(cmd)) {
                return [cmd, plugin];
            }
            return [handler, plugin];
        }))
    );
    if (plugins[cmd]) {
        await plugins[cmd]({ sock, m, id, psn: args.join(' '), sender, noTel, attf });
    }

}
export async function startBot(notelp) {
    const phoneNumber = await getPhoneNumber(notelp);
    if (!phoneNumber) {
        console.log(chalk.yellow("Sesi sudah ada, tidak perlu nomor baru."));
        globalThis.io.emit("broadcastMessage","Sesi sudah ada, tidak perlu nomor baru.");
        return;
    }
    const bot = new Kanata({ phoneNumber, sessionId: globalThis.sessionName });

    bot.start().then(sock => {
        sock.ev.on('messages.upsert', async chatUpdate => {
            try {
                const m = chatUpdate.messages[0];
                const { remoteJid } = m.key;
                const sender = m.pushName || remoteJid;
                const id = remoteJid;
                const noTel = remoteJid.split('@')[0].replace(/[^0-9]/g, '');

                if (m.message?.imageMessage || m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
                    const imageMessage = m.message.imageMessage || m.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage;
                    const imageBuffer = await getMedia({ message: { imageMessage } });
                    const commandImage = m.message.imageMessage?.caption || m.message.extendedTextMessage?.text;
                    await prosesPerintah({ command: commandImage, sock, m, id, sender, noTel, attf: imageBuffer });
                }

                if (m.message?.audioMessage || m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.audioMessage) {
                    const audioMessage = m.message.audioMessage || m.message.extendedTextMessage.contextInfo.quotedMessage.audioMessage;
                    // console.log(chatUpdate.type)
                    if (!m.message?.audioMessage?.contextInfo?.quotedMessage) return
                    const audioBuffer = await getMedia(audioMessage);
                    const commandAudio = m.message.audioMessage?.caption || m.message.extendedTextMessage?.contextInfo?.quotedMessage?.audioMessage?.caption;
                    await prosesPerintah({ command: commandAudio, sock, m: audioMessage, id, sender, noTel, attf: audioBuffer });
                }

                if (m.message?.videoMessage || m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage) {
                    const videoMessage = m.message.videoMessage || m.message.extendedTextMessage.contextInfo.quotedMessage.videoMessage;
                    const videoBuffer = await getMedia(videoMessage);
                    const commandVideo = m.message.videoMessage?.caption || m.message.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage?.caption;
                    await prosesPerintah({ command: commandVideo, sock, m: videoMessage, id, sender, noTel, attf: videoBuffer });
                }
                if (m.message?.interactiveResponseMessage?.nativeFlowResponseMessage) {
                    const cmd = JSON.parse(m.message.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson);
                    // console.log(cmd.id)
                    await prosesPerintah({ command: `!${cmd.id}`, sock, m, id, sender, noTel });
                }

                const chat = await clearMessages(m);
                if (chat) {
                    const parsedMsg = chat.chatsFrom === "private" ? chat.message : chat.participant.message;
                    if (tebakSession.has(id)) {
                        await checkAnswer(id, parsedMsg.toLowerCase(), sock, m, noTel);
                    } else {
                        await prosesPerintah({ command: parsedMsg, sock, m, id, sender, noTel });
                    }
                }
            } catch (error) {
                console.log('Error handling message:', error);
            }
        });

        sock.ev.on('group-participants.update', ev => groupParticipants(ev, sock));
        sock.ev.on('groups.update', ev => groupUpdate(ev, sock));
        sock.ev.on('call', (callEv) => {
            call(callEv, sock)
        })
    }).catch(error => console.log("Error starting Bot:", error));
}
globalThis.io.on('connection', (sock) => {
    sock.on('generateQR', async (phoneNumber) => {
        try {
            console.log(`Nomor telepon diterima: ${phoneNumber}`);
            await startBot(phoneNumber);
            globalThis.io.emit('broadcastMessage', `Bot berhasil dimulai untuk nomor: ${phoneNumber}`);
        } catch (error) {
            console.log(error);
            globalThis.io.emit('broadcastMessage', `Gagal memulai bot: ${error.message}`);
        }
    });

    console.log(chalk.green('WebSocket connected...'));
    sock.on('disconnect', () => {
        console.log('WebSocket disconnected');
    });
});

server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
});











