let isAudioProcessing = false;

chrome.runtime.onMessage.addListener(async (message, sender) => {
  if (message.type === 'adDetected') {
    const { enabled } = await chrome.storage.local.get('enabled');
    if (enabled ?? true) {
      if (!isAudioProcessing) {
        await chrome.offscreen.createDocument({
          url: 'offscreen.html',
          reasons: ['USER_MEDIA'],
          justification: 'To detect screams for skipping ads.',
        });
        isAudioProcessing = true;
      }
    }
  } else if (message.type === 'screamDetected') {
    skipAd(sender.tab.id);
    if (isAudioProcessing) {
      await chrome.offscreen.closeDocument();
      isAudioProcessing = false;
    }
  }
});

async function skipAd(tabId) {
    // ... Logic from Step 6 will go here ...
    console.log("Scream detected! Skipping ad...");
}
