// background.js - The Workaround Version

chrome.runtime.onMessage.addListener(async (message, sender) => {
  // Listen for the "adDetected" message from the content script
  if (message.type === 'adDetected') {
    const { enabled } = await chrome.storage.local.get('enabled');
    if (enabled ?? true) {
      // If enabled, tell the content script to start listening for screams
      chrome.tabs.sendMessage(sender.tab.id, { type: 'startScreamDetection' });
    }
  } 
  // Listen for the "screamDetected" message from the content script
  else if (message.type === 'screamDetected') {
    // When a scream is heard, run our ad-skipping logic
    skipAd(sender.tab.id);
  }
});

// This ad-skipping function remains the same
async function skipAd(tabId) {
  console.log(`Scream detected on tab ${tabId}! Attempting to skip ad...`);
  try {
    await chrome.debugger.attach({ tabId }, "1.2");
    const { result } = await chrome.debugger.sendCommand(
      { tabId },
      "Runtime.evaluate",
      { expression: "document.querySelector('.ytp-ad-skip-button-modern, .ytp-ad-skip-button').getBoundingClientRect()" }
    );

    if (result && result.value) {
      const rect = result.value;
      const x = Math.round(rect.left + rect.width / 2);
      const y = Math.round(rect.top + rect.height / 2);

      await chrome.debugger.sendCommand(
        { tabId },
        "Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 }
      );
      await chrome.debugger.sendCommand(
        { tabId },
        "Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 }
      );
      console.log("Successfully dispatched click to skip ad!");
    } else {
      console.log("Skip button not found.");
    }
    await chrome.debugger.detach({ tabId });
  } catch (e) {
    console.error("Debugger error:", e.message);
  }
}