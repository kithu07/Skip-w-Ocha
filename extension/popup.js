// DOM Elements
const toggle = document.getElementById('toggle');
const sensitivity = document.getElementById('sensitivity');
const sensitivityDisplay = document.getElementById('sensitivity-display');
const micTestBtn = document.getElementById('mic-test');
const voiceMeterSection = document.getElementById('voice-meter-section');
const meterBar = document.getElementById('meter-bar');
const screamLevel = document.getElementById('scream-level');
const modal = document.getElementById('ocha-modal');
const modalClose = document.getElementById('modal-close');
const modalMeter = document.getElementById('modal-meter');

// Audio context and analyzer
let audioContext;
let analyser;
let microphone;
let dataArray;
let isListening = false;

// Load and display saved settings when popup opens
chrome.storage.local.get(['enabled', 'sensitivity'], (data) => {
  toggle.checked = data.enabled ?? true; // Enabled by default
  sensitivity.value = data.sensitivity ?? 5; // Default sensitivity 5
  sensitivityDisplay.textContent = sensitivity.value;
});

// Save settings whenever they are changed
toggle.addEventListener('change', () => {
  chrome.storage.local.set({ enabled: toggle.checked });
  
  // Visual feedback
  if (toggle.checked) {
    showNotification('Extension enabled! 🎤');
  } else {
    showNotification('Extension disabled');
  }
});

sensitivity.addEventListener('input', () => {
  const value = parseInt(sensitivity.value);
  sensitivityDisplay.textContent = value;
  chrome.storage.local.set({ sensitivity: value });
  
  // Visual feedback
  sensitivityDisplay.style.transform = 'scale(1.2)';
  setTimeout(() => {
    sensitivityDisplay.style.transform = 'scale(1)';
  }, 200);
});

// Mic test functionality
micTestBtn.addEventListener('click', () => {
  if (isListening) {
    stopListening();
    micTestBtn.innerHTML = '<span class="mic-icon">🎤</span>Test Mic';
    micTestBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  } else {
    startListening();
  }
});

// Modal close
modalClose.addEventListener('click', () => {
  modal.style.display = 'none';
});

// Close modal when clicking outside
modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});

// Start listening to microphone
function startListening() {
  console.log("Requesting microphone access...");
  
  // Check if getUserMedia is available
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showNotification('Microphone access not supported in this browser! 😔');
    return;
  }

  // Request microphone access in popup context
  navigator.mediaDevices.getUserMedia({ 
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    } 
  })
    .then(function(stream) {
      console.log("Microphone access granted successfully");
      
      // Create audio context
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      
      microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      
      dataArray = new Uint8Array(analyser.frequencyBinCount);
      isListening = true;
      
      voiceMeterSection.style.display = 'block';
      updateMeter();
      
      micTestBtn.innerHTML = '<span class="mic-icon">⏹️</span>Stop Test';
      micTestBtn.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%)';
      
      showNotification('Microphone activated! 🎤');
    })
    .catch(function(err) {
      console.error("Microphone access denied:", err);
      
      let errorMessage = 'Microphone access denied! ';
      if (err.name === 'NotAllowedError') {
        errorMessage += 'Please allow microphone access in your browser settings.';
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'No microphone found. Please connect a microphone.';
      } else {
        errorMessage += err.message;
      }
      
      showNotification(errorMessage + ' 😔');
    });
}

// Stop listening to microphone
function stopListening() {
  if (microphone && microphone.mediaStream) {
    microphone.mediaStream.getTracks().forEach(track => track.stop());
  }
  if (audioContext) {
    audioContext.close();
  }
  
  isListening = false;
  voiceMeterSection.style.display = 'none';
  meterBar.style.width = '0%';
  screamLevel.textContent = '0%';
  
  showNotification('Microphone stopped');
}

// Update voice meter
function updateMeter() {
  if (!isListening) return;
  
  analyser.getByteFrequencyData(dataArray);
  
  // Calculate average volume
  const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
  const volume = Math.min(100, (average / 255) * 100);
  
  // Update meter bar
  meterBar.style.width = volume + '%';
  screamLevel.textContent = Math.round(volume) + '%';
  
  // Update modal meter if open
  if (modal.style.display === 'flex') {
    modalMeter.style.transform = `scale(${1 + volume / 100})`;
  }
  
  // Continue updating
  requestAnimationFrame(updateMeter);
}

// Show notification
function showNotification(message) {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 14px;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
    transform: translateX(100%);
    transition: transform 0.3s ease;
    max-width: 300px;
    word-wrap: break-word;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Remove after 4 seconds for longer messages
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 4000);
}

// Function to show Ocha Indakuu modal (called from content script)
window.showOchaModal = function() {
  modal.style.display = 'flex';
  
  // Animate the meter
  let meterScale = 1;
  const animateMeter = () => {
    meterScale = 1 + Math.random() * 0.5;
    modalMeter.style.transform = `scale(${meterScale})`;
    setTimeout(animateMeter, 100);
  };
  animateMeter();
  
  // Auto-close after 5 seconds
  setTimeout(() => {
    modal.style.display = 'none';
  }, 5000);
};

// Listen for postMessage events from content script
window.addEventListener('message', (event) => {
  // Verify origin for security
  if (event.origin !== window.location.origin && !event.origin.includes('youtube.com')) {
    return;
  }
  
  if (event.data && event.data.type === 'adDetected' && event.data.action === 'showOchaModal') {
    window.showOchaModal();
  }
  
  if (event.data && event.data.type === 'screamDetected') {
    console.log('Scream detected with volume:', event.data.volume);
    // Handle scream detection if needed
  }
});

// Listen for messages from content script via chrome.runtime
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'showOchaModal') {
    window.showOchaModal();
  }
  
  if (request.type === 'screamDetected') {
    console.log('Scream detected with volume:', request.volume);
    // Handle scream detection if needed
  }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    modal.style.display = 'none';
  }
});

// Initialize with a welcome message
setTimeout(() => {
  showNotification('Welcome to Skip-w-Ocha! 🎤');
}, 500);