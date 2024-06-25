////////////////////////////////////////////////////////////////////////////////////
///////// This file helps puppeteer finds his HTML buttons to click on /////////////
////////////////////////////////////////////////////////////////////////////////////

async function closePopup(page, counters) {
    const closePopupButton = await page.$('#onetrust-close-btn-container button.onetrust-close-btn-handler');
        
    if (closePopupButton) {
      await closePopupButton.click();
      console.log('Closed the pop-up.');
      counters.closedCookiesPopup++;
    } else {
      console.error('Pop-up close button not found.');
    }
    await new Promise(r => setTimeout(r, 1000));
}

async function compareButton(page, counters) {
    await new Promise(r => setTimeout(r, 2000));
  await page.click('a.all.compare-btn.active.compare-all-btn');
  await new Promise(r => setTimeout(r, 1000));

  const compareButton = await page.$('a.compare-tab-contents.compare-now');

  if (compareButton) {
    await compareButton.click();
    counters.compareButtonClicks++;
    console.log('Clicked on the "Compare" button.');
    await page.waitForNavigation();
  } else {
    console.error('Compare button not found.');
  }
}

async function exportButton(page, link, counters) {
    await new Promise(r => setTimeout(r, 2000));
  const exportButton = await page.$('#exportCompare');
  if (exportButton) {
    await exportButton.click();
    console.log('Clicked on the "Export" button. at link:', link);
    counters.exportButtonClicks++;
  } else
    console.error('Export button not found.');
  // Wait for the download to complete
  await new Promise(r => setTimeout(r, 3000));
}

module.exports = {
    closePopup,
    compareButton,
    exportButton
};