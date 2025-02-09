import RPG from '../../database/models/RPG.js';

export default async ({ sock, m, id, noTel, psn }) => {
    try {
        const [cmd, ...args] = psn ? psn.split(' ') : [''];
        const action = cmd?.toLowerCase();
        const itemName = args.join(' ');

        // Inisialisasi player
        await RPG.initPlayer(noTel);

        // Jika tidak ada command tambahan, tampilkan menu toko
        if (!action) {
            const items = await RPG.getAllShopItems();
            let text = '*🏪 TOKO*\n\n';
            
            // Kelompokkan items berdasarkan category
            const categories = {};
            items.forEach(item => {
                if (!categories[item.category]) {
                    categories[item.category] = [];
                }
                categories[item.category].push(item);
            });

            // Tampilkan items yang bisa dibeli
            text += '*📦 ITEMS YANG BISA DIBELI:*\n';
            for (const [category, items] of Object.entries(categories)) {
                if (items.some(item => item.buy_price > 0)) {
                    text += `\n${category.toUpperCase()}:\n`;
                    items.forEach(item => {
                        if (item.buy_price > 0) {
                            text += `${item.name}\n`;
                            text += `💰 Harga: ${item.buy_price} gold\n`;
                            text += `📝 ${item.description}\n\n`;
                        }
                    });
                }
            }

            // Tampilkan items yang bisa dijual
            text += '\n*💎 ITEMS YANG BISA DIJUAL:*\n';
            for (const [category, items] of Object.entries(categories)) {
                if (items.some(item => item.is_sellable)) {
                    text += `\n${category.toUpperCase()}:\n`;
                    items.forEach(item => {
                        if (item.is_sellable) {
                            text += `${item.name}\n`;
                            text += `💰 Harga: ${item.sell_price} gold\n`;
                            text += `📝 ${item.description}\n\n`;
                        }
                    });
                }
            }

            text += '\nCara penggunaan:\n';
            text += '!toko beli <nama_item>\n';
            text += '!toko jual <nama_item> [jumlah]\n';
            
            await sock.sendMessage(id, { text });
            return;
        }

        // Proses pembelian
        if (action === 'beli') {
            if (!itemName) {
                await sock.sendMessage(id, { 
                    text: '❌ Masukkan nama item yang ingin dibeli!' 
                });
                return;
            }

            const result = await RPG.buyItem(noTel, itemName);
            await sock.sendMessage(id, { 
                text: `✅ Berhasil membeli ${result.item.name}\n💰 -${result.item.buy_price} gold` 
            });
            return;
        }

        // Proses penjualan
        if (action === 'jual') {
            if (!itemName) {
                await sock.sendMessage(id, { 
                    text: '❌ Masukkan nama item yang ingin dijual!' 
                });
                return;
            }

            // Parse jumlah item yang akan dijual
            const words = args.join(' ').split(' ');
            const lastWord = words[words.length - 1];
            let amount = 1;
            let itemToSell = itemName;

            // Cek apakah kata terakhir adalah angka
            if (!isNaN(lastWord)) {
                amount = parseInt(lastWord);
                itemToSell = words.slice(0, -1).join(' ');
            }

            try {
                const result = await RPG.sellItem(noTel, itemToSell, amount);
                let text = `✅ Berhasil menjual ${result.amount}x ${result.item.name}\n`;
                text += `💰 +${result.totalPrice} gold\n`;
                if (result.remainingQuantity > 0) {
                    text += `📦 Sisa: ${result.remainingQuantity}x`;
                }
                await sock.sendMessage(id, { text });
            } catch (error) {
                await sock.sendMessage(id, { 
                    text: `❌ ${error.message}` 
                });
            }
            return;
        }

        await sock.sendMessage(id, { 
            text: '❌ Command tidak valid! Gunakan !toko untuk melihat menu' 
        });

    } catch (error) {
        await sock.sendMessage(id, { 
            text: `❌ Error: ${error.message}` 
        });
    }
};

export const handler = 'toko';
export const tags = ['rpg'];
export const command = ['toko', 'shop'];
export const help = 'Buka toko untuk beli/jual item\nPenggunaan: !toko [beli/jual] [nama_item] [jumlah]'; 