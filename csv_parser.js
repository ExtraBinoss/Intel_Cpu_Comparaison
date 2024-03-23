/*
** EPITECH PROJECT, 2023
** myapp
** File description:
** csv_parser.js
*/

const fsPromises = require('fs').promises;
const { removeCharacterFromFiles } = require('./utils');
const fs = require('fs');
const path = require('path');

// all interesting labels to parse
let ID_TO_PARSE = ["Processor Number","Recommended Customer Price","Use Conditions", "Litography", "Total Cores", "Max Turbo Frequency", "Total Threads", "Processor Base Frequency", "Cache", "TDP","# of Cores", "Marketing Status", "Launch Date",
  "Max Memory Size (dependent on memory type)", "Memory Types",
  "Graphics Base Frequency", "GPU Name",
  "4K Support","DirectX Support","OpenGL Support",
  "Package Size",
  "Intel Turbo Boost Technology", "Intel Hyper-Threading Technology", "Intel Virtualization Technology (VT-x) ", "Secure Key"];

let globalCsvData = [];

async function my_csv_parser(currentFile) {
  let csvData = [];
  let lines = currentFile.split('\n');
  // Parse the csv file for the first comma and then the rest of the data
  let firstLineWithComma = lines.find(line => line.includes(','));
  //find the processor names (searching the first comma in the file.)
  if (firstLineWithComma) {
    let firstCommaIndex = firstLineWithComma.indexOf(',');
    let restOfLine = firstLineWithComma.substring(firstCommaIndex + 1);
    let processorNames = restOfLine.split(',').map(name => name.replace('Processor', '').replace('®', '').replace('™', '').replace('processor', '').trim());
    for (let i = 0; i < processorNames.length; i++) {
      let processorData = { ProcessorName: processorNames[i] };

      // search for all the ID_TO_PARSE in the file
      for (let id of ID_TO_PARSE) {
        let line = lines.find(line => line.includes(id));
        if (line) {
          let commaIndex = line.indexOf(",");
          let data = line.substring(commaIndex + 1).split(',');
          processorData[id] = data[i] || null;
        } else {
          processorData[id] = null;
        }
      }
      csvData.push(processorData);
      globalCsvData.push(processorData); // Append to the global array
    }
    return null;
  }
  return csvData;
}

// After processing all files, write the global array to the file
async function writeGlobalCsvDataToFile() {
  const filePath = 'public/parsed_processors.txt';
  await fsPromises.writeFile(filePath, JSON.stringify(globalCsvData, null, 2));
}




async function processCsvFiles() {
  const csvDirPath = path.join(process.cwd(), 'fetched_processors', 'intel-processors');
  removeCharacterFromFiles(csvDirPath, '®');
  removeCharacterFromFiles(csvDirPath, '™');
  removeCharacterFromFiles(csvDirPath, '‡');
  removeCharacterFromFiles(csvDirPath, '*');
  removeCharacterFromFiles(csvDirPath, '®');
  console.log("im here");
  const csvFiles = fs.readdirSync(csvDirPath);
  
  for (const file of csvFiles) {
    if (path.extname(file) !== '.csv') {
      continue;
    }
    //print the file name
    console.log(file);
    const filePath = path.join(csvDirPath, file);
    const fileData = fs.readFileSync(filePath, 'utf-8');
    await my_csv_parser(fileData);
  }
  
  // Write the global array to the file
  await writeGlobalCsvDataToFile();
  
  return globalCsvData;
}

module.exports = {
    processCsvFiles,
    my_csv_parser
};