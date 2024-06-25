////////////////////////////////////////////////////////////////////////////////////
///////// This is the file that helps the main program to get it's work done////////
////////////////////////////////////////////////////////////////////////////////////

const puppeteer = require('puppeteer-extra');
const fsPromises = require('fs').promises;
const path = require('path');
function getUniqueDirectoryName() {
    const date = new Date();
    const timestamp = date.getTime();
    return `fetched_processors_${timestamp}`;
}

function getCurrentDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const today = `${year}_${month}_${day}`;
    return today;
}

async function executeLinksInChunks(links, counters, chunkSize) {
    console.log('Executing links in chunks...');
    for (let i = 0; i < links.length; i += chunkSize) {
      const currentChunk = links.slice(i, i + chunkSize);
      await Promise.all(currentChunk.map(processLink));
    }
}

async function init_pages(link, counters) {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--incognito'],
    });
  
    const page = await browser.newPage();
          console.log('Opened the link:', link);
  
    await page.viewport({
        width: 1024 + Math.floor(Math.random() * 100),
        height: 768 + Math.floor(Math.random() * 100),
    });
    const cookies = await page.cookies(link);
    await page.deleteCookie(...cookies);
    await page.goto(link, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 5000));
    counters.linksOpened++;
    return {browser, page};
}

async function removeCharacterFromFiles(directory, character) {
    const files = await fsPromises.readdir(directory);
    console.log("im here");
    for (const file of files) {
        if (path.extname(file) === '.csv') {
        const filePath = path.join(directory, file);
        let fileContent = await fsPromises.readFile(filePath, 'utf-8');
        fileContent = fileContent.replace(character, '');
        console.log(filePath);
        await fsPromises.writeFile(filePath, fileContent);
        }
    }
}

module.exports = {
    getUniqueDirectoryName,
    getCurrentDate,
    executeLinksInChunks,
    init_pages,
    removeCharacterFromFiles
};