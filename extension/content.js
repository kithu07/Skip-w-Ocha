// content.js - Skip-w-Ocha Voice-Powered Ad Skipper

// Part 1: AD DETECTION LOGIC - Using DOM observation only
const adObserver = new MutationObserver((mutations) => {
  // Use DOM observation to detect ads - no cross-origin requests
  const adContainer = document.querySelector('.video-ads.ytp-ad-module');
  const adShowing = document.querySelector('.ad-showing');
  const skipButton = document.querySelector('.ytp-ad-skip-button') || 
                    document.querySelector('.ytp-ad-skip-button-modest') ||
                    document.querySelector('[aria-label="Skip ad"]') ||
                    document.querySelector('[aria-label="Skip"]');
  
  // Check if any ad-related elements are present
  if ((adContainer && adContainer.innerHTML.length > 0) || adShowing || skipButton) {
    console.log("🎤 Ad detected! Time to scream!");
    
    // Start scream detection
    startScreamDetection();
    
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
let audioContext;
let analyser;
let microphone;
let dataArray;

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'startScreamDetection' && !isListening) {
    startScreamDetection();
  }
});

function startScreamDetection() {
  // Get extension settings first
  chrome.storage.local.get(['enabled', 'sensitivity'], (data) => {
    if (!data.enabled) {
      console.log("Extension is disabled");
      return;
    }

    const sensitivityThreshold = (data.sensitivity || 5) / 10; // Convert 1-10 to 0-1
    console.log(`🎤 Listening for screams with sensitivity: ${sensitivityThreshold}`);

    // Check if getUserMedia is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error("Microphone access not supported in this browser");
      return;
    }

    // Request microphone access with explicit constraints
    navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      } 
    })
      .then(function(stream) {
        // Success - mic access granted
        console.log("Microphone access granted for scream detection");
        
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);

        analyser.fftSize = 256;
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        isListening = true;
        let lastScreamTime = 0;

        const detectScream = () => {
          if (!isListening) return;

          analyser.getByteFrequencyData(dataArray);
          
          // Calculate average volume
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          const volume = average / 255; // Normalize to 0-1

          // Check if scream is loud enough
          if (volume > sensitivityThreshold) {
            const now = Date.now();
            if (now - lastScreamTime > 2000) { // 2-second cooldown
              lastScreamTime = now;
              console.log(`💥 SCREAM DETECTED! Volume: ${Math.round(volume * 100)}%`);
              
              // Send scream detected message via chrome.runtime
              chrome.runtime.sendMessage({ 
                type: 'screamDetected',
                volume: volume,
                timestamp: now
              });
              
              // Try to skip the ad
              skipAd();
              
              // Stop listening
              stopListening();
            }
          }
          
          if (isListening) {
            requestAnimationFrame(detectScream);
          }
        };

        detectScream();
        
      })
      .catch(function(err) {
        console.error("Microphone access denied for scream detection:", err);
        
        if (err.name === 'NotAllowedError') {
          console.log("Microphone permission denied - user needs to allow access");
        } else if (err.name === 'NotFoundError') {
          console.log("No microphone found");
        } else {
          console.log("Microphone error:", err.message);
        }
      });
  });
}

function stopListening() {
  if (microphone && microphone.mediaStream) {
    microphone.mediaStream.getTracks().forEach(track => track.stop());
  }
  if (audioContext) {
    audioContext.close();
  }
  isListening = false;
  console.log("🎤 Stopped listening for screams");
}

function skipAd() {
  try {
    // Use multiple selectors for different ad types
    const skipButton = document.querySelector('.ytp-ad-skip-button, .ytp-ad-skip-button-modern, [aria-label="Skip ad"], [aria-label="Skip"]');
    
    if (skipButton) {
      console.log("⏭️ Clicking skip button!");
      skipButton.click();
      showSuccessMessage();
    } else {
      // Fallback: try to find any skip-related button
      const buttons = document.querySelectorAll('button');
      for (const button of buttons) {
        const text = button.textContent.toLowerCase();
        if (text.includes('skip') || text.includes('ad')) {
          console.log("⏭️ Found potential skip button:", button.textContent);
          button.click();
          showSuccessMessage();
          break;
        }
      }
    }
    
  } catch (error) {
    console.error("❌ Error skipping ad:", error);
  }
}

// Periodic scan for skip buttons (backup method)
function startPeriodicScan() {
  setInterval(() => {
    const skipBtn = document.querySelector('.ytp-ad-skip-button, .ytp-ad-skip-button-modern');
    if (skipBtn && isListening) {
      console.log("⏭️ Periodic scan found skip button!");
      skipBtn.click();
      showSuccessMessage();
    }
  }, 1000);
}

function showSuccessMessage() {
  // Create a beautiful success notification
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
    color: white;
    padding: 20px 30px;
    border-radius: 12px;
    font-family: 'Inter', sans-serif;
    font-weight: 700;
    font-size: 18px;
    z-index: 10000;
    box-shadow: 0 8px 32px rgba(76, 175, 80, 0.4);
    animation: slideIn 0.3s ease;
  `;
  notification.innerHTML = '🎉 Ad Skipped Successfully! 🎉';
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
    to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translate(-50%, -50%) scale(1); opacity: 1; }
    to { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
  }
`;
document.head.appendChild(style);

// Start periodic scan as backup
startPeriodicScan();

console.log("🎤 Skip-w-Ocha content script loaded! Ready to detect ads and screams!");