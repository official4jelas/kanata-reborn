import axios from "axios";

export const spotifySearch = async (name) => {
    try {
        const { data } = await axios.get('https://fastrestapis.fasturl.cloud/music/spotify', {
            params: {
                name
            }
        })
        return data.result[0].url;
    } catch (error) {
        return error
    }
}

export const spotifySong = async (q) => {
    try {
        // https://api.siputzx.my.id/api/s/spotify?query=serana
        const url = await spotifySearch(q)
        const { data } = await axios.get('https://api.siputzx.my.id/api/d/spotify', {
            params: {
                url
            }
        })
        return {
            thumbnail: data.result.coverImage,
            title: data.result.title,
            author: data.result.artist,
            audio: data.result.downloadMp3
        }

    } catch (error) {
        return error
    }
}

// export const spotifyCanvas = ({ artist, album, img, timeStart, timeEnd, title }) => {
//     return canvafy.Spotify()
//         .setAlbum(album)
//         .setAuthor(artist)
//         .setImage(img)
//         .setTitle(title)
//         .setTimestamp(timeStart, timeEnd)
//         .setSpotifyLogo(true)
//         .setBlur(5)
// }

// (async () => { console.log(await spotifySong('jkt48 sanjou')) })()