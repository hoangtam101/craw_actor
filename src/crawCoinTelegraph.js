const cheerio = require("cheerio");
const Apify = require('apify');

async function handler() {
    Apify.main(async () => {
        // Create a RequestList
        const requestList = await Apify.openRequestList('start-urls', [
            { url: 'https://cointelegraph.com/' },
        ]);
        // Function called for each URL
        const handlePageFunction = async ({ request, page }) => {
            console.log(request.url);
            const title = await page.title()
            const content = await page.content()

            const scrapedData = [];
            const $ = cheerio.load(content)
            let results = []
            if (request.url.includes('press-releases')) {
                $('.posts-listing__item').each((index, el) => {
                    const title = $(el).find('.post-card-inline__title').text()
                    const content = $(el).find('.post-card-inline__text').text()
                    const thumbnail = $(el).find('.lazy-image__img').attr('src')
                    const author = $(el).find('.post-card__author-link').text()
                    const url = $(el).find('.post-card-inline__title-link').attr('href')
                    const date = $(el).find('.post-card-inline__date').attr('datetime')
                    const elem = {'title': title, 'content': content, 'thumbnail': thumbnail, 'author': author, 'date': date, 'url': `${request.url}${url}`}
                    results.push(elem)
                })
            }
            else {
                $('.posts-listing__item').each((index, el) => {
                    const title = $(el).find('.post-card__title').text()
                    const content = $(el).find('.post-card__text').text()
                    const thumbnail = $(el).find('.lazy-image__img').attr('src')
                    const author = $(el).find('.post-card__author-link').text()
                    const url = $(el).find('.post-card__title-link').attr('href')
                    const date = $(el).find('.post-card__date').attr('datetime')
                    const elem = {'title': title, 'content': content, 'thumbnail': thumbnail, 'author': author, 'date': date, 'url': `${request.url}${url}`}
                    results.push(elem)
                })
                $('.main-news-controls__item').each((index, el) => {
                    const title = $(el).find('.main-news-controls__link').text()
                    const url = $(el).find('.main-news-controls__link').attr('href')
                    const elem = {'title': title,'url': `${request.url}${url}`}
                    results.push(elem)
                })
            }
            const dataset = await Apify.openDataset('cointelegraph');
            await dataset.pushData(results);
        };
        // Create a PuppeteerCrawler
        const crawler = new Apify.PuppeteerCrawler({
            requestList,
            handlePageFunction,
            launchContext: {
                // Chrome with stealth should work for most websites.
                // If it doesn't, feel free to remove this.
                launchOptions: {
                    headless: true,
                }
            }
        });
        // Run the crawler
        await crawler.run();
    });
};

handler()
