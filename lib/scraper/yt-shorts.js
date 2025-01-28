/**
 * @author : Roidev~404~
 * @Channel : https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m
 * @name : Youtube Shorts Downloader
 * @module : ES6 Module
 * bebas pake, jangan cabut wmnya jir 🙇
 */

import puppeteer from 'puppeteer';

export const ytShorts = async (url) => {
    try {
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();

        await page.goto('https://en1.savefrom.net/23-youtube-shorts-downloader-2RM.html', { waitUntil: 'networkidle2' });

        const inputSelector = '#sf_url';
        await page.waitForSelector(inputSelector);
        await page.type(inputSelector, url);

        const submitButtonSelector = '#sf_submit';
        await page.click(submitButtonSelector);

        const resultSelector = '#sf_result';
        await page.waitForSelector(resultSelector, { visible: true });

        const result = await page.evaluate(() => {
            const videoSrc = document.querySelector('a.link-download')?.getAttribute('href');


            return { videoSrc };
        });


        await browser.close();

        return result;
    } catch (error) {
        throw new Error('Terjadi error saat scraping:', error)
    }
};

// scrapeData('https://www.youtube.com/shorts/7F-X7fxeufc');
