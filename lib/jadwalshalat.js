import { readFile } from 'fs/promises';
import fs from 'fs/promises';
import fetch from 'node-fetch';
import cron from 'node-cron';
import { setTimeout } from 'timers';

const URL = 'https://fastrestapis.fasturl.cloud/religious/prayerschedule?city=Purbalingga';
const FILE_PATH = 'lib/services/jadwalshalat.json';
const data = await readFile(FILE_PATH, 'utf-8');
const jsh = JSON.parse(data);
const today = new Date().getDate().toString().padStart(2, '0')
const jadwalToday = jsh.result.monthSchedule.find(item => item.date === today);

async function fetchPrayerSchedule() {
    try {
        const response = await fetch(URL);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        await fs.writeFile(FILE_PATH, JSON.stringify(data, null, 2));
        console.log(`Prayer schedule updated: ${new Date().toISOString()}`);
    } catch (error) {
        console.error('Failed to fetch prayer schedule:', error);
    }
}


const delayUntil = (targetTime, callback) => {
    const now = new Date();
    const delay = targetTime - now;

    if (delay > 0) {
        setTimeout(callback, delay);
    }
};
export const schedulePrayerReminders = async (sock, chatId) => {

    if (!jadwalToday) {
        console.log('Jadwal tidak ditemukan untuk hari ini');
        return;
    }

    const now = new Date();

    const prayerTimes = [
        { name: 'Sahur', time: "02:30" },
        { name: 'Imsyak', time: jadwalToday.imsyak },
        { name: 'Shubuh', time: jadwalToday.shubuh },
        { name: 'Terbit', time: jadwalToday.terbit },
        { name: 'Dhuha', time: jadwalToday.dhuha },
        { name: 'Dzuhur', time: jadwalToday.dzuhur },
        { name: 'Ashar', time: jadwalToday.ashr },
        { name: 'Maghrib', time: jadwalToday.maghrib },
        { name: 'Isya', time: jadwalToday.isya }
    ];
    prayerTimes.forEach(({ name, time }) => {
        const [hours, minutes] = time.split(':').map(Number);
        const prayerTime = new Date(now);
        prayerTime.setHours(hours, minutes, 0, 0);

        delayUntil(prayerTime, () => {
            let text = `🔔 Hai @everyone 🔔\n`
            if (name == 'Sahur') {
                text += `Waktunya *${name}*, mari bergegas menyiapkan Santapan sahur 📿🤲🏻`
                text += `\n\n _dan Selamat menjalankan ibadah Sahur Ramadhan_`
            } else if (name == 'Terbit') {
                text += `*Semangat Pagi*`
                text += `\nWaktu *${name}* telah tiba,selamat beraktifitas,semoga apa yang kita jalani hari ini senantiasa dilindungi dan dimudahkan oleh Allah SWT🤲🏻.`
            } else if (name == 'Imsyak') {
                text += `Waktu *${name}* telah tiba,Selamat menjalankan ibadah puasa Ramadhan`
                text += `\nSemoga puasa kita diterima oleh Allah SWT🤲🏻.`
            } else {
                text += `\nWaktu Shalat *${name}* telah tiba,tinggalkan aktivitas sejenak,ambillah wudhu dan laksanakan kewajiban 📿🤲🏻`
                text += `\n\n*${time}*\n _Untuk Wilayah Purbalingga dan sekitarnya_`
            }
            text += '\n\n_Pesan otomatis oleh_ *Kanata-V2*'
            sock.sendMessage(chatId, { text });
            console.log(`Notifikasi ${name} dikirim!`);
        });
    });
};



cron.schedule('0 0 */28 * *', fetchPrayerSchedule);
// fetchPrayerSchedule()

