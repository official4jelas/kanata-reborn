import { spotifySong } from "../../lib/neoxr/spotify.js";

export const handler = 'play'
export const description = 'Search Spotify Song/Artist'
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    try {
        if (psn === '') {
            await sock.sendMessage(id, { text: '🎵 Masukkan judul lagu yang ingin diputar atau dicari.' });
            return;
        }


        await sock.sendMessage(id, { text: `🔍 Sedang mencari *${psn}*... di Spotify` });
        let { thumbnail, title, author, audio } = await spotifySong(psn)
        caption = '*Hasil Pencarian Spotify*';
        caption += `\n\n🎶 *Judul:* ${title}`;
        caption += `\n\n🎶 *Author:* ${author}`;
        caption += `\n _⏳ Bentar yaa, audio lagi dikirim ⏳_`;
        // let image = spotifyCanvas({
        //     artist: 'Kanata',
        //     album: 'Hinamizawa',
        //     img: result.thumbnail,
        //     timeStart: 0,
        //     timeEnd: moment.duration(result.duration).asSeconds,
        //     title: result.title
        // })
        await sock.sendMessage(id, { image: { url: thumbnail }, caption }, { quoted: m });

        await sock.sendMessage(id, { audio: { url: audio }, mimetype: 'audio/mpeg', fileName: title }, { quoted: m });

    } catch (error) {
        await sock.sendMessage(id, { text: '❌ Ups, terjadi kesalahan: ' + error.message });
    }
};
