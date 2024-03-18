////////////////////////////////////////////////////////////////////////////////////
///////// This file is helping scrapeProcessorLinks do it's magic //////////////////
////////////////////////////////////////////////////////////////////////////////////


const puppeteer = require('puppeteer-extra');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const UserPreferencesPlugin = require('puppeteer-extra-plugin-user-preferences');

const { getUniqueDirectoryName } = require('./utils');
const { init_pages } = require('./utils');
const { closePopup, compareButton, exportButton } = require('./html_finders');
const promisify = require('util').promisify;
const renameAsync = promisify(fs.rename);


const FILE_PATH = 'processor_links.txt';

async function launchBrowser() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    return { browser, page };
}

function filterLinks(processorLinks) {
    const keywordsToRemove = ['gigabit', 'ethernet', 'gpu', 'raid', 'server', 'storage', 'chipsets', 'family',
      'optane', 'wi-fi', 'stratix', 'development', 'fpga', 'interface', 'signal', 'wireless',
      'riser', 'memory', 'management', 'power', 'rail', 'riser', 'data-center', 'max', 'add',
      'accelerator', 'options', 'option', 'basic', 'embedded', 'ip', 'programmable'];
    return processorLinks.filter(link => !keywordsToRemove.some(keyword => link.includes(keyword)));
}


// Function to write the links to a file
function writeLinksToFile(filteredLinks) {
    const filePath = FILE_PATH;
    fs.writeFileSync(filePath, filteredLinks.join('\n') + '\n', 'utf-8');
    console.log('Links written to:', filePath);
}

// Function to navigate to the URL and get the processor links
async function getProcessorLinks(page) {
    const url = 'https://ark.intel.com/content/www/us/en/ark.html#@Processors';
    await page.goto(url, { waitUntil: 'domcontentloaded' });
  
    return await page.$$eval('.product[data-order] a.ark-accessible-color',
      links => links.map(link => 'https://ark.intel.com' + link.getAttribute('href')));
}

async function writeCountersToFile(counters) {
    const countersFilePath = 'operation_counters.txt';
    fs.writeFileSync(countersFilePath, JSON.stringify(counters, null, 2), 'utf-8');
    console.log(`Operation counters written to: ${countersFilePath}`);
} 


async function processLink(link, counters, linksWithNavigationIssues) {
    try {
      const directoryName = getUniqueDirectoryName();
      
      const downloadDirectoryPath = path.join(process.cwd(), 'fetched_processors', directoryName);
  
      if (!fs.existsSync(downloadDirectoryPath)) {
        fs.mkdirSync(downloadDirectoryPath);
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
      const {browser, page} = await init_pages(link, counters);
      // close cookie popup if there is any
      await closePopup(page, counters);
      // Click the "Compare" button
      await compareButton(page, counters);
      // Click the "Export" button
      await exportButton(page, downloadDirectoryPath, link, counters);
        await fileChanger(downloadDirectoryPath, link, counters);
      //List directory files and rename the file
      await browser.close();
      return linksWithNavigationIssues;
    }
    catch (error) {
      console.error('Error occurred while processing link:', link);
      console.error(error);
      return linksWithNavigationIssues;
    }
  }


  let uniqueIdCounter = 1;
  const linkIdMap = {};
  
  async function fileChanger(downloadDirectoryPath, link, counters) {
    try {
      const filesInDirectory = await fsPromises.readdir(downloadDirectoryPath);
  
      if (filesInDirectory.length > 0) {
        const linkName = link.slice(link.lastIndexOf('/') + 1, -5);
  
        const uniqueId = uniqueIdCounter++;
        const destinationFolder = path.join(process.cwd(), 'fetched_processors', 'intel_processors');
  
        if (!fs.existsSync(destinationFolder)) {
          fs.mkdirSync(destinationFolder, { recursive: true });
        }
  
        for (const file of filesInDirectory) {
          const oldPath = path.join(downloadDirectoryPath, file);
          const newPath = path.join(destinationFolder, `${linkName}_${uniqueId}.csv`);
  
          await renameAsync(oldPath, newPath);
          console.log(`File ${file} was moved to intel_processors folder as ${linkName}_${uniqueId}.csv`);
          counters.downloadedFiles++;
        }
  
        // Remove the directory if it exists
        await removeUnwantedFiles(downloadDirectoryPath);
      } else {
        console.error('No files found in the download directory.');
        await removeUnwantedFiles(downloadDirectoryPath);
      }
    } catch (error) {
      console.error('Error occurred in fileChanger:', error);
    }
  }
  
async function removeUnwantedFiles(downloadDirectoryPath) {
try {
    if (downloadDirectoryPath) {
    await fsPromises.rm(downloadDirectoryPath, { recursive: true });
    console.log(`Directory ${downloadDirectoryPath} was removed.`);
    } else {
    console.log('Download directory path is null or undefined. No directory removed.');
    }
} catch (error) {
    if (error.code === 'ENOENT') {
    console.log(`Directory ${downloadDirectoryPath} does not exist.`);
    } else {
    console.error(`Error removing directory ${downloadDirectoryPath}: ${error.message}`);
    }
}
}
module.exports = {
    filterLinks,
    writeLinksToFile,
    getProcessorLinks,
    launchBrowser,
    writeCountersToFile,
    processLink,
    fileChanger,
    removeUnwantedFiles,
};