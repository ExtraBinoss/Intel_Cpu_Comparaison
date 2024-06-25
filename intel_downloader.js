const puppeteer = require('puppeteer-extra');
const fs = require('fs');
const path = require('path');



const loadFolderLinks = () => {
    const jsonFilePath = path.join(process.cwd(), 'folder_links.json');
  
    if (!fs.existsSync(jsonFilePath)) {
      console.warn('No folder_links.json file found. Run the newCompareAll function first.');
      return {};
    }
  
    const folderLinks = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
    return folderLinks;
  };
  
  const downloadSpecification = async ({ link, counters, downloadDirectoryPath }) => {
  
    // Use puppeteer-extra to set up user preferences and plugins
    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: null,
      args: ['--start-maximized'],
      userPreferences: {
        download: {
          prompt_for_download: false,
          open_pdf_in_system_reader: true,
          default_directory: downloadDirectoryPath,
        },
        plugins: {
          always_open_pdf_externally: true,
        },
      },
    });
    const page = await browser.newPage();
  
    // Navigate to the link
    await page.goto(link, { waitUntil: 'networkidle2' });
  
    // Click the "Export" button
    await page.evaluate(() => {
      const exportLink = document.querySelector('.export-container .export-link');
      if (exportLink) {
        exportLink.click();
        console.log('Downloading file...');
      }
    });
  
    // Wait for the download to start
    await new Promise(r => setTimeout(r, 2000));
  
    console.log(`file :  ${link}  is downloaded at :  ${downloadDirectoryPath}`);
  
    // Close the page and browser
    await page.close();
    await browser.close();
  
    // Increment the downloadedFiles counter
    counters.downloadedFiles++;
  };
  
  async function cluster_execution(cluster, folderLinks, counters, downloadDirectoryPath) {
    await cluster.task(async ({ page, data: link }) => {
      await downloadSpecification({link, counters, downloadDirectoryPath});
      counters.downloadedFiles++;
      console.log(`Downloaded ${counters.downloadedFiles} of ${Object.keys(folderLinks).length} files`);
    });
  
    for (const [folderName, links] of Object.entries(folderLinks)) {
      for (const link of links) {
        await cluster.queue(link);
      }
    }
  
    cluster.on('taskerror', (err, data) => {
      console.log(`  Error crawling ${data}: ${err.message}`);
    });
  
    await cluster.idle();
    await cluster.close();
  }

module.exports = {
    loadFolderLinks,
    downloadSpecification,
    cluster_execution
};