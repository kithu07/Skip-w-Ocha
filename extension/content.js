const adObserver = new MutationObserver((mutations) => {
    const adShowing = document.querySelector('.ad-showing');
    if (adShowing) {
      console.log("Ad detected!");
      // Send a message to the background script
      chrome.runtime.sendMessage({ type: 'adDetected' });
      // Disconnect to avoid sending multiple messages for the same ad
      adObserver.disconnect();
    }
  });
  
  // Start observing the document body for changes
  adObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });