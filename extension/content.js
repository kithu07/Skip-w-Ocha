// content.js - The Workaround Version

// Part 1: AD DETECTION LOGIC
const adObserver = new MutationObserver((mutations) => {
  // Use a more reliable check for the ad container
  const adContainer = document.querySelector('.video-ads.ytp-ad-module');
  if (adContainer && adContainer.innerHTML.length > 0) {
    console.log("Ad container detected!");
    chrome.runtime.sendMessage({ type: 'adDetected' });
    adObserver.disconnect(); // Stop observing to prevent duplicate messages
  }
});

// Start observing the main YouTube player container
const targetNode = document.querySelector('ytd-player');
if (targetNode) {
    adObserver.observe(targetNode, { childList: true, subtree: true });
}

// Part 2: SCREAM DETECTION LOGIC
let isListening = false;

// Listen for the "startScreamDetection" message from our background script
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'startScreamDetection' && !isListening) {
    isListening = true;
    startAudioProcessing();
  }
});

function startAudioProcessing() {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      analyser.fftSize = 256;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let lastScreamTime = 0;

      const detectScream = async () => {
        analyser.getByteTimeDomainData(dataArray);
        let sumSquares = 0.0;
        for (const amplitude of dataArray) {
          const normalized = (amplitude / 128.0) - 1.0;
          sumSquares += normalized * normalized;
        }
        const rms = Math.sqrt(sumSquares / dataArray.length);

        const { sensitivity } = await chrome.storage.local.get('sensitivity');
        const threshold = sensitivity ?? 0.5;

        if (rms > threshold) {
          const now = Date.now();
          if (now - lastScreamTime > 3000) { // 3-second cooldown
            lastScreamTime = now;
            console.log("Scream detected! Telling background script to skip ad.");
            chrome.runtime.sendMessage({ type: 'screamDetected' });
            
            // Stop listening and release the microphone
            stream.getTracks().forEach(track => track.stop());
            isListening = false;
            return; // Exit the loop
          }
        }
        
        if (isListening) {
            requestAnimationFrame(detectScream);
        }
      };
      detectScream();
    })
    .catch(err => {
      console.error("Microphone access denied in content script:", err);
    });
}