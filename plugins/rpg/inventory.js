import RPG from '../../database/models/RPG.js';

export default async ({ sock, m, id, noTel }) => {
    try {
        await RPG.initPlayer(noTel);
        const inventory = await RPG.getInventory(noTel);
        
        let text = `*🎒 INVENTORY*\n\n`;
        
        if (inventory.length === 0) {
            text += 'Inventory kosong';
        } else {
            inventory.forEach(item => {
                text += `📦 ${item.name} (${item.quantity}x)\n`;
                text += `Type: ${item.type}\n`;
                text += `Rarity: ${item.rarity}\n`;
                text += `Effect: ${item.description}\n\n`;
            });
        }

        await sock.sendMessage(id, { text });
    } catch (error) {
        await sock.sendMessage(id, { text: `Error: ${error.message}` });
    }
};

export const handler = 'inventory'; 