// This file is the main entry point for the cpu benchmarkers

//express is a node module for building HTTP servers
const express = require('express');
//path is a node module for working with file and directory paths
const path = require('path');
//fs is a node module for working with the file system

// Puppeteer plugins
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const UserPreferencesPlugin = require('puppeteer-extra-plugin-user-preferences');

// my included files
const { loadFolderLinks, cluster_execution } = require('./intel_downloader');

// includes : scrape_functions.js
const { newCrawlProcessorLinks } = require('./new_scrapper');

// includes : csv_parser.js
const { processCsvFiles } = require('./csv_parser');

const FILE_PATH = 'processor_links.txt';
const fs = require('fs');
const {init_pages, getUniqueDirectoryName} = require('./utils');


// Constants or Macros

const app = express();
const port = 3001;

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')))

const { Cluster } = require('puppeteer-cluster');

app.get('/intelDownloader', async (req, res) => {
  try {
    const folderLinks = loadFolderLinks();
    const downloadDirectoryPath = path.join(process.cwd(), 'fetched_processors', "intel-processors");
    const counters = {
      linksOpened: 0,
      linksRejected: 0,
      downloadedFiles: 0,
      closedCookiesPopup: 0,
      compareButtonClicks: 0,
      exportButtonClicks: 0,
    };
    (async function() {
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
      const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
        args: ['--start-maximized'],
      });  
      
      const cluster = await Cluster.launch({
          browser,
          concurrency: Cluster.CONCURRENCY_BROWSER,
          maxConcurrency: 10,
          monitor: true,
      });
      cluster_execution(cluster, folderLinks, counters, downloadDirectoryPath);
    })();
    
    res.status(200).send('Downloading done.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error occurred while downloading specifications');
  }
});


const {newCompareAll} = require('./new_Crawl_Scraping');



app.get('/newScrape', async (req, res) => {
  try {
    await newCompareAll();

    res.status(200).send('Comparing and downloading done.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error occurred while scraping');
  }
});



app.get('/newCrawler', async (req, res) => {
  try {
    await newCrawlProcessorLinks(); // returns processor links.txt
    res.status(200).send('Crawling completed successfully!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error occurred while crawling');
  }
});

// Usage
app.get('/csvParser', async (req, res) => {
try {
  const csvData = await processCsvFiles();
  res.send(csvData); // You can also send this data in the response if needed
} catch (error) {
  console.error('Error occurred while parsing CSV:', error);
  res.status(500).send('Error occurred while parsing CSV');
}
});


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'main_page.html'));
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
