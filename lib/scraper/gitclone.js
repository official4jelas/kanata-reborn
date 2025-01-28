/**
 * @author : Roidev~404~
 * @Channel : https://whatsapp.com/channel/0029VagADOLLSmbaxFNswH1m
 * @name : Pddikti Scraper
 * @module : ES6 Module
 * bebas pake, jangan cabut wmnya jir 🙇
 */
import puppeteer from "puppeteer";

export const gitClone = async (url) => {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });
    await page.waitForSelector('a#:r20:                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          ');
    const data = await page.$$eval('a#:r20:', elements => {
        return elements.map(element => element.href);
    });
    await browser.close();
    return data;
}

(async () => {
    console.log(await gitClone('https://github.com/idlanyor/kanata-reborn'))
})()
