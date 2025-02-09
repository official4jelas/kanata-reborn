import RPG from '../../database/models/RPG.js';

export default async ({ sock, m, id, noTel, psn }) => {
    try {
        if (!psn) {
            await sock.sendMessage(id, { text: 'Sebutkan makanan yang mau dimakan!' });
            return;
        }

        await RPG.initPlayer(noTel);
        const effect = await RPG.eat(noTel, psn);
        
        let text = `*🍽️ MAKAN*\n\n`;
        text += `Lapar +${effect.hunger}\n`;
        text += `Energi +${effect.energy}`;

        await sock.sendMessage(id, { text });
    } catch (error) {
        await sock.sendMessage(id, { text: `Error: ${error.message}` });
    }
};

export const handler = 'makan'; 