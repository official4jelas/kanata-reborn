import { betaDownload } from '../helper/betabotz.js';
import { nyxs } from '../helper/nxys.js';
import { ryzen } from '../helper/ryzen.js';
import { skizo } from '../helper/skizo.js';
export async function tiktok(url) {
    try {
        let result = await skizo('tiktok', {
            params: {
                url: url
            }
        })
        // return result.data
        return { title: result.data.data.title, video: result.data.data.play, audio: result.data.data.music }
    } catch (error) {
        return error
    }
}
export async function snack(url) {
    try {
        let result = await betaDownload('snackvideo', {
            params: {
                url: url
            }
        })
        // return result.data
        return { title: result.data.result.title, video: result.data.result.media, author: result.data.result.author }
    } catch (error) {
        return error
    }
}

// console.log(await tiktok('https://vt.tiktok.com/ZSjWP7x83/'))
export async function meta(url) {
    try {
        let result = await skizo('fb', {
            params: {
                url: url
            }
        })
        if (result.data?.url) {
            return result.data.url
        }
        return result.data[0].url
    } catch (error) {
        return error
    }
}
// console.log(await meta('https://www.instagram.com/reel/DDCJKb8vXcc/?igsh=MXNzeGlpZGF3NXNrZw=='))
// console.log(await meta('https://www.facebook.com/share/r/14bjUseLMP/'))

function getYouTubeId(url) {
    // Regex kanggo njupuk ID YouTube
    const match = url.match(/(?:v=|youtu\.be\/|youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/);

    // Yen match ketemu, njupuk ID YouTube-nya
    return match ? match[1] : null;
}
export async function yutub(url) {
    let id = getYouTubeId(url);
    console.log(id)
    try {
        let response = await nyxs(`dl/yt-direct`, {
            params: {
                url: `https://www.youtube.com/watch?v=${id}`
            }
        })
        let result = await response.data.result
        return {
            thumbnail: result.thumbnail,
            title: result.title,
            duration: result.length,
            audio: result.urlAudio,
            video: result.urlVideo,
        }
    } catch (error) {
        return { error: error.message || "Terjadi kesalahan saat memproses permintaan." };
    }
}
export async function yutubVideo(url) {
    let id = getYouTubeId(url);
    try {
        let response = await betaDownload('yt', {
            params: {
                url: `https://www.youtube.com/watch?v=${id}`
            }
        })
        // return response.data.result
        return {
            thumbnail: response.data.result.thumb,
            title: response.data.result.title,
            channel: 'YNTKTS',
            video: response.data.result.mp4,
        }
    } catch (error) {
        return { error: error.message || "Terjadi kesalahan saat memproses permintaan." };
    }
}
export async function yutubAudio(url) {
    let id = getYouTubeId(url);
    try {
        let response = await ryzen('downloader/ytmp3', {
            params: {
                url: `https://www.youtube.com/watch?v=${id}`
            }
        })
        // return response.data.result
        return {
            thumbnail: response.data.thumbnail,
            title: response.data.videoUrl,
            channel: response.data.author || 'YNTKTS',
            audio: response.data.url,
        }
    } catch (error) {
        return { error: error.message || "Terjadi kesalahan saat memproses permintaan." };
    }
}
export async function spotify(url) {
    try {
        let response = await betaDownload('spotify', {
            params: {
                url
            }
        })
        // return response.data.result
        return {
            thumbnail: response.data.result.data.thumbnail,
            title: response.data.result.data.title,
            artist: response.data.result.data.artist.name,
            audio: response.data.result.data.url,
            duration: response.data.result.data.duration,
        }
    } catch (error) {
        return { error: error.message || "Terjadi kesalahan saat memproses permintaan." };
    }
}


export async function threads(url) {
    try {
        let response = await betaDownload('threads', {
            params: {
                url
            }
        })
        return response.data.result.video_urls[0].download_url

    } catch (error) {
        return { error: error.message || "Terjadi kesalahan saat memproses permintaan." };
    }
}

// await yutubVideo('https://www.youtube.com/watch?v=8tZlvoUZ-Ek&pp=ygUMeWEgYmVnaXR1bGFo')
// console.log(await yutubVideo('https://www.youtube.com/watch?v=8tZlvoUZ-Ek&pp=ygUMeWEgYmVnaXR1bGFo'))
// console.log(await threads('https://www.threads.net/@panoramapurwokerto/post/DDLVSeQTQSU?xmt=AQGzP7ElW9JAnhlrwVz91RkWvQqX2G_6ArHdPJi6aLfveg'))
// console.log(await spotify('https://open.spotify.com/track/2gcMYiZzzmzoF8PPAfL3IO?si=XGDKMzmmSJ2rHjvpE_Yuow'))
// // console.log(await youtube.batchDownload(["https://www.youtube.com/watch?v=8tZlvoUZ-Ek&pp=ygUMeWEgYmVnaXR1bGFo"],1))
// // console.log(await meta("https://www.instagram.com/reel/C81uiueJ4ho/?utm_source=ig_web_copy_link"))