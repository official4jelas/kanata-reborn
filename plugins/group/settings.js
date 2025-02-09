import Group from '../../database/models/Group.js';

export const handler = 'settings';
export const description = 'Mengatur fitur grup';
export default async ({ sock, m, id, psn, sender }) => {
    try {
        if (!psn) {
            const settings = await Group.getSettings(id);
            let text = '*🛠️ PENGATURAN GRUP*\n\n';
            text += `Antilink: ${settings.antilink ? '✅' : '❌'}\n`;
            text += `Welcome: ${settings.welcome ? '✅' : '❌'}\n`;
            text += `Goodbye: ${settings.goodbye ? '✅' : '❌'}\n`;
            text += `Antispam: ${settings.antispam ? '✅' : '❌'}\n`;
            text += `Antitoxic: ${settings.antitoxic ? '✅' : '❌'}\n`;
            text += `Only Admin: ${settings.only_admin ? '✅' : '❌'}\n\n`;
            text += 'Untuk mengubah: !settings <fitur> on/off';
            
            await sock.sendMessage(id, { text });
            return;
        }

        const [feature, value] = psn.split(' ');
        if (!['antilink', 'welcome', 'goodbye', 'antispam', 'antitoxic', 'only_admin'].includes(feature)) {
            await sock.sendMessage(id, { text: '❌ Fitur tidak valid!' });
            return;
        }

        const newValue = value === 'on';
        await Group.updateSetting(id, feature, newValue);
        await sock.sendMessage(id, { 
            text: `✅ Berhasil mengubah ${feature} menjadi ${newValue ? 'aktif' : 'nonaktif'}`
        });
    } catch (error) {
        await sock.sendMessage(id, { text: `Error: ${error.message}` });
    }
}; 