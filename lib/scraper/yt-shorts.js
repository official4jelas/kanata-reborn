import puppeteer from 'puppeteer';

const scrapeData = async (url) => {
    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        await page.goto('https://shortsnoob.com/en1', { waitUntil: 'networkidle2' });

        const inputSelector = '#url';
        await page.waitForSelector(inputSelector);
        await page.type(inputSelector, url);

        const submitButtonSelector = '#start'; 
        if (await page.$(submitButtonSelector)) {
            await page.click(submitButtonSelector);
        } else {
            console.warn('Tombol submit gak ditemukan, pastikan selektornya bener.');
        }

        const resultSelector = '#result';
        await page.waitForSelector(resultSelector, { visible: true });

        const result = await page.evaluate(() => {
            const videoSrc = document.querySelector('video source')?.getAttribute('src');
            const downloadLinks = Array.from(
                document.querySelectorAll('.download-table a')
            ).map((a) => a.href);

            return { videoSrc, downloadLinks };
        });

        console.log('Hasil scraping:', result);

        await browser.close();

        return result;
    } catch (error) {
        console.error('Terjadi error saat scraping:', error);
    }
};

// Contoh pemanggilan
scrapeData('https://www.youtube.com/shorts/7F-X7fxeufc');
