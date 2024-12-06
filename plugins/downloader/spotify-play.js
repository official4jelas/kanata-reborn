import moment from "moment";
import { spotifySong } from "../../lib/neoxr/spotify.js";
import { spotify } from "../../lib/downloader.js";

export const handler = 'play'
export const description = 'Search Spotify Song/Artist'
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    try {
        if (psn === '') {
            await sock.sendMessage(id, { text: '🎵 Masukkan judul lagu yang ingin diputar atau dicari.' });
            return;
        }


        await sock.sendMessage(id, { text: `🔍 Sedang mencari *${psn}*... di Spotify` });
        let searchResult = await spotifySong(psn)
        let result = await spotify(searchResult.url)
        caption = '*Hasil Pencarian Spotify*';
        caption += `\n\n🎶 *Judul:* ${searchResult.title}`;
        caption += `\n\n🎶 *Author:* Kanata`;
        caption += `\n⏳ *Durasi:* ${searchResult.duration}`;
        caption += `\n _⏳ Bentar yaa, audio lagi dikirim ⏳_`;
        // let image = spotifyCanvas({
        //     artist: 'Kanata',
        //     album: 'Hinamizawa',
        //     img: result.thumbnail,
        //     timeStart: 0,
        //     timeEnd: moment.duration(result.duration).asSeconds,
        //     title: result.title
        // })
        await sock.sendMessage(id, { image: { url: result.thumbnail }, caption }, { quoted: m });

        await sock.sendMessage(id, { audio: { url: result.audio }, mimetype: 'audio/mpeg', fileName: result.title }, { quoted: m });

    } catch (error) {
        await sock.sendMessage(id, { text: '❌ Ups, terjadi kesalahan: ' + error.message });
    }
};
