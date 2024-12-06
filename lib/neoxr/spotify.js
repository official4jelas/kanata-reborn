import { neo } from "../../helper/neoxr.js"
import canvafy from "canvafy";

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

export const spotifySong = async (q) => {
    try {
        const { data } = await neo('/spotify-search', {
            params: {
                q
            }
        })
        return data.data[0];
    } catch (error) {
        return error
    }
}

export const spotifyCanvas = ({ artist, album, img, timeStart, timeEnd, title }) => {
    return canvafy.Spotify()
        .setAlbum(album)
        .setAuthor(artist)
        .setImage(img)
        .setTitle(title)
        .setTimestamp(timeStart, timeEnd)
        .setSpotifyLogo(true)
        .setBlur(5)
}

(async () => { console.log(await spotifySong('jkt48 sanjou')) })()