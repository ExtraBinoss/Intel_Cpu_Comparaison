fetch('parsed_processors.txt')
.then(response => response.json())
.then(data => {
// Save the processors data
    const processors = data;

    // Get the input box
    const inputBox = document.getElementById('inputBox');

    // Create the autocomplete dropdown
    const autocompleteDropdown = document.createElement('div');
    autocompleteDropdown.setAttribute('id', 'autocompleteDropdown');
    autocompleteDropdown.setAttribute('class', 'autocomplete-dropdown');
    inputBox.parentNode.appendChild(autocompleteDropdown);

    // Listen for input event on the input box
    inputBox.addEventListener('input', () => {
        const userInput = inputBox.value;
        console.log(userInput);
        const matchingProcessors = Object.values(processors).filter(processor =>
            processor.ProcessorName.toLowerCase().includes(userInput.toLowerCase())
        );
        console.log(matchingProcessors);

        // only 10 processors in autocomplete
        const limitedProcessors = matchingProcessors.slice(0, 5);

        autocompleteDropdown.innerHTML = '';

        limitedProcessors.forEach(processor => {
            const option = document.createElement('div');
            option.innerText = processor.ProcessorName; // Change 'name' to 'ProcessorName'
            option.addEventListener('click', () => {
                inputBox.value = processor.ProcessorName; // Change 'name' to 'ProcessorName'
                autocompleteDropdown.innerHTML = '';
            });
            autocompleteDropdown.appendChild(option);
        });
    });
});

document.getElementById("okButton").addEventListener("click", function() {
    var x = document.getElementById("inputBox").value;
    fetch('parsed_processors.txt')
    .then(response => response.json())
    .then(data => {
        let processors = data;
    // Fetch the processors data or perform any additional processing as needed
    // Display processor information
    // Note: You may need to modify this part based on your requirements
    const matchingProcessor = Object.values(processors).find(processor =>
        processor.ProcessorName.toLowerCase() === x.toLowerCase()
    );

    if (matchingProcessor) {
        displayProcessorInfo(matchingProcessor);
    }
});
});

function displayProcessorInfo(processor)
{
    const processorInfoContainer = document.createElement('div');
    processorInfoContainer.classList.add('box_dimension', 'processorInfo');
    
    const processorInfoContent = document.createElement('div');

    for (const [key, value] of Object.entries(processor)) {
        const infoElement = document.createElement('div');
        infoElement.innerHTML = `<strong>${key}:</strong> ${value}`;
        processorInfoContent.appendChild(infoElement);
    }
    
    const removeButton = document.createElement('button');
    removeButton.classList.add('removeButton');
    removeButton.textContent = '⨯';
    removeButton.addEventListener('click', function() {
        processorInfoContainer.remove();
    });
    processorInfoContainer.appendChild(removeButton);
    processorInfoContainer.appendChild(processorInfoContent);

    document.querySelector('.wrapper').appendChild(processorInfoContainer);
}



window.inputBox = function() {
    var x = document.getElementById("inputBox").value;
}
        document.getElementById("newCrawlerButton").addEventListener("click", async function() {
            try {
                const response = await fetch('/newCrawler');
                const data = await response.text();
                console.log(data);
                document.getElementById('statusMessage').innerText = data;
            } catch (error) {
                console.error('Error occurred while triggering new crawler:', error);
            }
        });
        document.getElementById("newScrapeButton").addEventListener("click", async function() {
            try {
                const response = await fetch('/newScrape');
                const data = await response.text();
                console.log(data);
                document.getElementById('statusMessage').innerText = data;
            } catch (error) {
                console.error('Error occurred while triggering new scrape:', error);
            }
        });
        document.getElementById("intelDownloaderButton").addEventListener("click", async function() {
            try {
                const response = await fetch('/intelDownloader');
                const data = await response.text();
                console.log(data);
                document.getElementById('statusMessage').innerText = data;
            } catch (error) {
                console.error('Error occurred while triggering Intel downloader:', error);
            }
        });
        document.getElementById("csvParser").addEventListener("click", async function() {
            try {
                const response = await fetch('/csvParser');
                const data = await response.text();
                if (data) {
                document.getElementById('statusMessage').innerText = "Parsing done";
                }
            } catch (error) {
                console.error('Error occurred while triggering Intel downloader:', error);
            }
        });

window.triggerScrape = function() {
    fetch('/scrape')
        .then(response => response.text())
        .then(data => {
            console.log(data);
        })
        .catch(error => console.error('Error:', error));
}