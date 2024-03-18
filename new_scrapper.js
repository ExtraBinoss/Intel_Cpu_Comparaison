/*
** EPITECH PROJECT, 2023
** node_website_cpu
** File description:
** new_scrapper.js
*/

  
const { writeLinksToFile } = require('./scrapingUtils');
const { launchBrowser } = require('./scrapingUtils');

async function newGetProcessorLinks(page) {
    const url = 'https://www.intel.com/content/www/us/en/products/details/processors.html'; // Replace 'URL_OF_YOUR_PAGE' with the actual URL
    await page.goto(url, { waitUntil: 'domcontentloaded' });
  
    // Extracting links from col-sm-3 elements inside panel panel-default
    const links = await page.$$eval('.panel.panel-default .col-sm-3 a[href]', anchors =>
        anchors.map(anchor => anchor.getAttribute('href'))
    );
  
    return links.map(link => 'https://ark.intel.com' + link);
  }
  
async function newCrawlProcessorLinks() {
    const { browser, page } = await launchBrowser();
    const processorLinks = await newGetProcessorLinks(page);
    writeLinksToFile(processorLinks);
    browser.close();
}

module.exports = {
    newCrawlProcessorLinks,
    newGetProcessorLinks 
};