import { mahasiswaDetail } from "../../lib/scraper/pddikti.js";
import loadAssets from "../../helper/loadAssets.js";

export const handler = 'pdd'
export const description = 'Resolve Information from PDDikti by NIM/Name'
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    if (psn == "") return await sock.sendMessage(id, { text: 'tidak bisa mengeksekusi secara langsung,silahkan gunakan fitur \`pddikti\` terlebih dahulu untuk menggunakan fitur ini' })
    await sock.sendMessage(id, { text: 'Tunggu sebentar,ini sedikit memakan waktu ...`' })
    
    const result = await mahasiswaDetail(psn)
    let text = `\`[PDDIKTI DATA RESULT]\`\n`;
    text += `Nama : \`${result['Nama']}\`\n`;
    text += `PT : \`${result['Perguruan Tinggi']}\`\n`;
    text += `JK : \`${result['Jenis Kelamin']}\`\n`;
    text += `Tgl. Msk : \`${result['Tanggal Masuk']}\`\n`;
    text += `NIM : \`${result['NIM']}\`\n`;
    text += `Prodi : \`${result['Jenjang - Program Studi']}\`\n`;
    text += `Status awal Mhs : \`${result['Status Awal Mahasiswa']}\`\n`;
    text += `Status akhir Mhs : \`${result['Status Terakhir Mahasiswa']}\`\n`;
    sock.sendMessage(id, {
        image: { url: await loadAssets('pddikti.jpg', 'image') },
        caption: text
    }, { quoted: m });
};
