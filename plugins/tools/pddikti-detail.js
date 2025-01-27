import { mahasiswaDetail } from "../../lib/scraper/pddikti.js";

export const handler = 'pdd'
export const description = 'Resolve Information from PDDikti by NIM/Name'
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    if (psn == "") return await sock.sendMessage(id, { text: 'Masukkan NIM/Nama untuk dicari,contoh `pddikti SSI202203088`' })
    await sock.sendMessage(id, { text: 'Tunggu sebentar,ini sedikit memakan waktu ...`' })
    
    const result = await mahasiswaDetail(psn)
    let text = `\`[PDDIKTI DATA RESULT]\``;
    text += `Nama : \`${result['Nama']}\``;
    text += `PT : \`${result['Perguruan Tinggi']}\``;
    text += `JK : \`${result['Jenis Kelamin']}\``;
    text += `Tgl. Msk : \`${result['Tanggal Masuk']}\``;
    text += `NIM : \`${result['NIM']}\``;
    text += `Prodi : \`${result['Jenjang - Program Studi']}\``;
    text += `Status awal Mhs : \`${result['Status Awal Mahasiswa']}\``;
    text += `Status akhir Mhs : \`${result['Status Terakhir Mahasiswa']}\``;
    sock.sendMessage(id, {
        text
    }, { quoted: m });
};
