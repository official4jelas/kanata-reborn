import { pddiktiSearch } from "../../lib/scraper/pddikti.js";

export const handler = 'pddikti'
export const description = 'Resolve Information from Pddikti by NIM/Name'
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    if (psn == "") return await sock.sendMessage(id, { text: 'Masukkan Nim/Nama untuk dicari,contoh `pddikti SSI202203088`' })
    await sock.sendMessage(id, { text: 'Tunggu sebentar,ini sedikit memakan waktu ...`' })
    const result = await pddiktiSearch(psn)
    const rows = []
    result.forEach((d, i) => {
        rows.push({
            header: d.link,
            highlight_label: d.nim,
            title: d.nama,
            description: `${d.programStudi} - ${d.perguruanTinggi}`,
            id: `pdd ${d.link}`,
        })
    })
    await sock.sendMessage(id, {
        text: `Hasil Pencarian *PDDikti* untuk ${psn}`,
        footer: 'Kanata-V2',
        buttons: [

            {
                buttonId: 'action',
                buttonText: {
                    displayText: 'PDDikti Scraper by Roy'
                },
                type: 4,
                nativeFlowInfo: {
                    name: 'single_select',
                    paramsJson: JSON.stringify({
                        title: 'message',
                        sections: [
                            {
                                title: 'Hasil Pencarian Pddikti',
                                highlight_label: '!',
                                rows
                            },
                        ],
                    }),
                },
            },
        ],
        headerType: 1,
        viewOnce: true
    }, { quoted: m });
};
