import { hikaru } from "../../helper/hikaru.js";
import loadAssets from "../../helper/loadAssets.js";
export const handler = 'roast'
export const description = 'Github Roast'
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    if (!psn) return sock.sendMessage(id, { text: "Masukkan username githubmu" })
    try {
        const { data } = await hikaru('aiexperience/github/roasting', {
            params: {
                username: psn,
                profile: true,
                language: 'id'
            }
        });
        let caption = "";
        caption += 'Nama \t\t: ' + data.result.profile.name || 'Belum diatur';
        caption += '\nBio \t\t\t: ' + data.result.profile.bio || 'Belum diatur';
        caption += '\nCompany \t: ' + data.result.profile.company || 'Belum diatur';
        caption += '\nFollowers \t: ' + data.result.profile.followers || 'Gak tau';
        caption += '\nFollowing \t: ' + data.result.profile.following || 'Gak tau';
        caption += '\nPublic Repo \t: ' + data.result.profile.public_repos || 'Belum bikin';
        caption += '\n\n' + data.result.roasting;


        await sock.sendMessage(id, { image: { url: 'https://f.sed.lol/files/TMJcw.png' }, caption }, { quoted: m });

    } catch (error) {
        await sock.sendMessage(id, { text: 'Username ngga ketemu nih,coba teliti lagi yaa.' })
    }
};
