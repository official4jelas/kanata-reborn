import { pddiktiSearch } from "../../lib/scraper/pddikti.js";

export const handler = 'pddikti'
export const description = 'Resolve Information from Pddikti by NIM/Name'
export default async ({ sock, m, id, psn, sender, noTel, caption, attf }) => {
    const result = await pddiktiSearch(psn)
    const rows = [
        {
            header: 'all feature',
            highlight_label: 'V2',
            title: '',
            description: 'Display to menu',
            id: 'menu',
        },
    ]
    result.forEach((d, i) => {
        rows.push({
            header: d.link,
            highlight_label: d.nim,
            title: d.nama,
            description: `${d.programStudi} - ${d.perguruanTinggi}`,
            id: `pdd ${d.link}`,
        })
    })
    sock.sendMessage(id, {
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
