import RPG from '../../database/models/RPG.js';

export default async ({ sock, m, id, noTel, psn }) => {
    try {
        if (!psn) {
            await sock.sendMessage(id, { text: 'Sebutkan minuman yang mau diminum!' });
            return;
        }

        await RPG.initPlayer(noTel);
        const effect = await RPG.drink(noTel, psn);
        
        let text = `*🥤 MINUM*\n\n`;
        text += `Haus +${effect.thirst}\n`;
        text += `Energi +${effect.energy}`;

        await sock.sendMessage(id, { text });
    } catch (error) {
        await sock.sendMessage(id, { text: `Error: ${error.message}` });
    }
};

export const handler = 'minum'; 