#[Intel CPU comparison 🔗](https://github.com/ExtraBinoss/Intel_Cpu_Comparaison)

---

## Goal of this project

The goal of this project is to compare the performance of different Intel processors. The data is scraped from the Intel website and stored in a database.

The user can then search for a processor and get a comparison of the performance of that processor with other processors.

It was made out of curiosity and to learn more about web scraping and databases.

---

## Library used

- Express
- Puppeteer
- Node.js

---

## How to run the project

1. Clone the repository

2. Install the dependencies

```bash
 $ npm install package.json
```

3. Run the server

```bash
nodemon cpu_compare.js
```

4. Open the browser and go to the following link

```bash
http://localhost:3001/
```

---

## Buttons and their functions

Crawler button:

![Trigger new crawler](readme_images/image.png)

This button triggers the web scraping process. It will get the links of all the processors from the Intel website and store them in the database.

New Scrape button:

![Trigger New Scrape](readme_images/image-1.png)

Opens every link from the crawler, scrapes all the available processors from the Intel website, and stores them in the database.

What happens when clicking the New Scrape button:

![What happens](readme_images/image-2.png)

Intel Downloader button: 

![Intel Downloader](readme_images/image-3.png)

Downloads the processors from the links found in the scraping process and stores them in a folder. [This process takes about 30 minutes]

Csv Parser button:

![Trigger Csv Parser](readme_images/image-4.png)

Parses the downloaded processors and stores them in the database.
the file is located in parsed_processors.txt and contains everything the website needs to start comparing processors.

---

## Now lets compare processors !

Step 1 : Searching processors 

![Search processor](readme_images/image-5.png)

Step 2 : Add more processors to compare

![Comparaison](readme_images/image-6.png)

## Author

- [Github](https://github.com/ExtraBinoss)
- Made during the second year at Epitech Technology