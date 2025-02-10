import { hikaru } from "../../helper/hikaru.js";
import loadAssets from "../../helper/loadAssets.js";

export const handler = "praise";
export const description = "Github Praise";

export default async ({ sock, m, id, psn }) => {
    if (!psn) {
        return sock.sendMessage(id, {
            text: "⚠️ Masukkan username GitHub kamu untuk mendapatkan pujian!"
        });
    }
    
    try {
        const { data } = await hikaru("aiexperience/github/praising", {
            params: {
                username: psn,
                profile: true,
                language: "id"
            }
        });
        
        const profile = data.result.profile;
        const caption = `🎉 *GitHub Praise* 🎉\n\n`
            + `👤 *Nama:* ${profile.name || "Belum diatur"}\n`
            + `📜 *Bio:* ${profile.bio || "Belum diatur"}\n`
            + `🏢 *Perusahaan:* ${profile.company || "Belum diatur"}\n`
            + `👥 *Followers:* ${profile.followers || "Gak tau"}\n`
            + `👤 *Following:* ${profile.following || "Gak tau"}\n`
            + `📂 *Public Repo:* ${profile.public_repos || "Belum bikin"}\n\n`
            + `💬 ${data.result.praising}`;
        
        const imageUrl = await loadAssets("github.png", "image");
        await sock.sendMessage(id, {
            image: { url: imageUrl },
            caption
        }, { quoted: m });
    } catch (error) {
        await sock.sendMessage(id, {
            text: "❌ Username tidak ditemukan. Coba periksa kembali ya!"
        });
        console.error("Error fetching GitHub Praise:", error);
    }
};
