import axios from "axios";
import { neo } from "../../helper/neoxr.js"
import { response } from "express";

export const spotifySearch = async (q) => {
    try {
        const { data } = await neo('/spotify-search', {
            params: {
                q
            }
        })
        return data.data;
    } catch (error) {
        return error
    }
}

export const spotifySong = async (url) => {
    try {
        const { data } = await axios.get('https://api.siputzx.my.id/api/d/spotify', {
            params: {
                url
            }
        })
        return response
       
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