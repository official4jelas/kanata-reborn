import puppeteer from 'puppeteer';

const scrapeData = async (q) => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://shortsnoob.com/en1');

    const inputSelector = '#url';
    await page.type(inputSelector, q);

    const buttonSelector = '#start';
    await page.click(buttonSelector);

    const contentSelector = '#result';
    await page.waitForSelector(contentSelector);

    const data = await page.$$eval('table.w-full tbody tr', rows => {
        return rows.map(row => {
            const columns = row.querySelectorAll('td');
            return {
                nama: columns[0]?.innerText.trim() || '',
                nim: columns[1]?.innerText.trim() || '',
                perguruanTinggi: columns[2]?.innerText.trim() || '',
                programStudi: columns[3]?.innerText.trim() || '',
                link: columns[4]?.querySelector('a')?.href || ''
            };
        });
    });

    console.log('Data yang di-scrape:', data);

    // Tutup browser
    await browser.close();
};

scrapeData();
