const puppeteer = require('puppeteer-extra');
const fs = require('fs');
const path = require('path');
const {init_pages, getUniqueDirectoryName} = require('./utils');
const {writeCountersToFile} = require('./scrapingUtils');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const UserPreferencesPlugin = require('puppeteer-extra-plugin-user-preferences');
const FILE_PATH = 'processor_links.txt';

async function newClosePopup(page) {
    try {
      // Wait for the close button to appear
      await page.waitForSelector('#onetrust-reject-all-handler', { timeout: 5000 }); // Adjust timeout as needed
      const closePopupButton = await page.$('#onetrust-reject-all-handler');
  
      if (closePopupButton) {
        // Click on the close button
        await closePopupButton.click();
        console.log('Closed the cookies popup');
      } else {
        console.error('Error: Cannot find the close button');
      }
    } catch (error) {
      console.error('Error occurred while closing the popup:', error);
    }
  }
  
  async function newProcessLink(link, counters, linksWithNavigationIssues) {
    try {
      // Extract the folder name from the link
      const urlParts = link.split('/');
      const folderName = `${urlParts[urlParts.length - 3]}-${urlParts[urlParts.length - 2]}-${urlParts[urlParts.length - 1].replace('.html', '')}`;
  
      const downloadDirectoryPath = path.join(process.cwd(), 'fetched_processors', folderName);
  
      if (!fs.existsSync(downloadDirectoryPath)) {
        fs.mkdirSync(downloadDirectoryPath, { recursive: true });
      }
      puppeteer.use(
        UserPreferencesPlugin({
          userPrefs: {
            download: {
              prompt_for_download: false,
              open_pdf_in_system_reader: true,
              default_directory: downloadDirectoryPath,
            },
            plugins: {
              always_open_pdf_externally: true,
            },
          },
        }),
        StealthPlugin()
      );
  
      //launch browser and init the puppeeter
      //remove their.html and replace with products.html
      link = link.replace('.html', '/products.html');
      const {browser, page} = await init_pages(link, counters);
  
      // close cookie popup if there is any
      await newClosePopup(page, counters);
  
      // Find all links containing '/content/www/us/en/products/sku/' and store them in an array
      const links = await page.$$eval('a[href*="/content/www/us/en/products/sku/"]', nodes => nodes.map(node => node.href));
  
      // Write the links to a file
      const linksFilePath = path.join(downloadDirectoryPath, 'links.txt');
      fs.writeFileSync(linksFilePath, links.join('\n'));
      counters.totalLinksFound += links.length;
      console.log("counter.totalLinksFound: ", counters.totalLinksFound); 
      console.log(`Found ${links.length} links. Written to ${linksFilePath}`);
      await browser.close();
      return { folderName: folderName, links: links }; // Replace directoryName with folderName
    }
    catch (error) {
      console.error('Error occurred while processing link:', link);
      console.error(error);
      return [];
    }
  }
  
  
  
  async function newCompareAll() {
    const filePath = FILE_PATH;
    const processorLinks = fs.readFileSync(filePath, 'utf-8').split('\n').filter(link => link.trim() !== '');
  
    let counters = {
      linksOpened: 0,
      linksRejected: 0,
      downloadedFiles: 0,
      closedCookiesPopup: 0,
      compareButtonClicks: 0,
      exportButtonClicks: 0,
      totalLinksFound: 0,
    };
  
    const concurrency = 5;
  
    const processLinksWithConcurrency = async (links) => {
      const results = [];
      for (const link of links) {
        results.push(newProcessLink(link, counters));
      }
      return Promise.all(results);
    };
  
    const results = [];
  
    // Split the links into chunks based on concurrency
    for (let i = 0; i < processorLinks.length; i += concurrency) {
      const currentChunk = processorLinks.slice(i, i + concurrency);
      const chunkResults = await processLinksWithConcurrency(currentChunk);
      results.push(...chunkResults);
    }
  
    const folderLinks = {};
  
    for (const result of results) {
      if (result.links.length > 0) {
        folderLinks[result.folderName] = result.links;
      }
    }
  
    // Save the folderLinks object to a JSON file
    const jsonFilePath = path.join(process.cwd(), 'folder_links.json');
    fs.writeFileSync(jsonFilePath, JSON.stringify(folderLinks, null, 2));
    console.log(`Folder links written to: ${jsonFilePath}`);
    // Click on more links until the end of the FILE_PATH
    await writeCountersToFile(counters);
  }
module.exports = {
    newClosePopup, newProcessLink, newCompareAll
};  