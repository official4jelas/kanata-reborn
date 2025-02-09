import RPG from '../../database/models/RPG.js';

export default async ({ sock, m, id }) => {
    try {
        const items = await RPG.shop();
        
        let text = `*🏪 TOKO*\n\n`;
        items.forEach(item => {
            text += `📦 ${item.name}\n`;
            text += `💰 Harga: ${item.price} gold\n`;
            text += `📝 Tipe: ${item.type}\n`;
            text += `✨ Rarity: ${item.rarity}\n`;
            text += `ℹ️ ${item.description}\n\n`;
        });
        
        text += `\nUntuk membeli: !beli <nama_item> <jumlah>`;

        await sock.sendMessage(id, { text });
    } catch (error) {
        await sock.sendMessage(id, { text: `Error: ${error.message}` });
    }
};

export const handler = 'toko'; 