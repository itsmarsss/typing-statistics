chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['contentScript.js']
      }, () => {
        console.log('Content script executed on tab change.');
      });
    }
  });
  
//   chrome.tabs.onActivated.addListener(activeInfo => {
//     chrome.scripting.executeScript({
//       target: { tabId: activeInfo.tabId },
//       files: ['contentScript.js']
//     }, () => {
//       console.log('Content script executed on tab change.');
//     });
//   });