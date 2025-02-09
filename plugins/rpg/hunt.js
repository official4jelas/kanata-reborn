import RPG from '../../database/models/RPG.js';

export default async ({ sock, m, id, noTel }) => {
    try {
        await RPG.initPlayer(noTel);
        const result = await RPG.hunt(noTel);
        
        let text = `*🏹 HUNTING RESULT*\n\n`;
        text += `💰 Gold: +${result.goldEarned}\n`;
        text += `✨ EXP: +${result.expEarned}\n`;
        text += `❤️ HP: -${result.healthLost}\n`;
        
        if (result.levelUp) {
            text += `\n🎉 Level Up! Sekarang level ${result.newLevel}!`;
        }

        await sock.sendMessage(id, { text });
    } catch (error) {
        await sock.sendMessage(id, { text: `Error: ${error.message}` });
    }
};

export const handler = 'hunt'; 