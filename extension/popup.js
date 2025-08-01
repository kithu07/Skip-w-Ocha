// popup.js - Cinema Usher Popup Interface

// DOM elements
const toggle = document.getElementById('toggle');
const sensitivity = document.getElementById('sensitivity');
const sensitivityValue = document.getElementById('sensitivityValue');
const scoldingType = document.getElementById('scoldingType');
const status = document.getElementById('status');
const statusDot = document.getElementById('statusDot');
const testBtn = document.getElementById('testBtn');
const debugBtn = document.getElementById('debugBtn');
const testPauseBtn = document.getElementById('testPauseBtn'); // Added for new test button

// Audio meter elements
const audioLevel = document.getElementById('audioLevel');
const levelIndicator = document.getElementById('levelIndicator');
const thresholdLine = document.getElementById('thresholdLine');
const meterStatus = document.getElementById('meterStatus');

// Current settings
let currentSettings = {
  isEnabled: false,
  sensitivity: 0.5,
  scoldingType: 'classic'
};

// Audio meter update interval
let audioMeterInterval = null;

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  console.log("🎭 Cinema Usher popup initializing...");
  
  try {
    await loadSettings();
    updateUI();
    setupEventListeners();
    startAudioMeterUpdates();
    
    // If monitoring was previously enabled, start it automatically
    if (currentSettings.isEnabled) {
      console.log("🎬 Restoring previous monitoring state...");
      await sendMessageToServiceWorker({
        type: 'START_MONITORING',
        sensitivity: currentSettings.sensitivity
      });
    }
  } catch (error) {
    console.error("❌ Error initializing popup:", error);
  }
});

// Load settings from storage
async function loadSettings() {
  try {
    const result = await chrome.storage.local.get(['settings']);
    currentSettings = result.settings || {
      isEnabled: false,
      sensitivity: 0.5,
      scoldingType: 'classic'
    };
    console.log("✅ Settings loaded:", currentSettings);
  } catch (error) {
    console.error("❌ Error loading settings:", error);
    // Use default settings if storage fails
    currentSettings = {
      isEnabled: false,
      sensitivity: 0.5,
      scoldingType: 'classic'
    };
  }
}

// Save settings to storage
async function saveSettings() {
  try {
    await chrome.storage.local.set({ settings: currentSettings });
    console.log("✅ Settings saved:", currentSettings);
  } catch (error) {
    console.error("❌ Error saving settings:", error);
  }
}

// Send message to service worker with retry
async function sendMessageToServiceWorker(message, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await chrome.runtime.sendMessage(message);
      return response;
    } catch (error) {
      console.error(`❌ Service worker communication attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

// Update UI based on current settings
function updateUI() {
  toggle.checked = currentSettings.isEnabled;
  sensitivity.value = currentSettings.sensitivity;
  // Update sensitivity value display
  const sensitivityValue = document.getElementById('sensitivityValue');
  if (sensitivityValue) {
    sensitivityValue.textContent = `${Math.round(currentSettings.sensitivity * 100)}%`;
  }
  scoldingType.value = currentSettings.scoldingType;
  
  // Update status
  if (currentSettings.isEnabled) {
    status.textContent = 'Usher Active';
    statusDot.className = 'status-dot enabled';
  } else {
    status.textContent = 'Usher Disabled';
    statusDot.className = 'status-dot disabled';
  }
}

// Setup event listeners
function setupEventListeners() {
  // Toggle switch
  toggle.addEventListener('change', async () => {
    try {
      currentSettings.isEnabled = toggle.checked;
      await saveSettings();
      updateUI();
      
      // Send settings update to service worker
      await sendMessageToServiceWorker({
        type: 'UPDATE_SETTINGS',
        settings: currentSettings
      });
      
      // Automatically start/stop monitoring based on toggle state
      if (currentSettings.isEnabled) {
        console.log("🎬 Toggle enabled - starting audio monitoring...");
        await sendMessageToServiceWorker({
          type: 'START_MONITORING',
          sensitivity: currentSettings.sensitivity
        });
      } else {
        console.log("🛑 Toggle disabled - stopping audio monitoring...");
        await sendMessageToServiceWorker({
          type: 'STOP_MONITORING'
        });
      }
      
      console.log("✅ Toggle updated:", currentSettings.isEnabled);
    } catch (error) {
      console.error("❌ Error updating toggle:", error);
    }
  });

  // Sensitivity slider
  sensitivity.addEventListener('input', async () => {
    try {
      currentSettings.sensitivity = parseFloat(sensitivity.value);
      // Update sensitivity value display
      const sensitivityValue = document.getElementById('sensitivityValue');
      if (sensitivityValue) {
        sensitivityValue.textContent = `${Math.round(currentSettings.sensitivity * 100)}%`;
      }
      await saveSettings();
      
      // Send settings update to service worker
      await sendMessageToServiceWorker({
        type: 'UPDATE_SETTINGS',
        settings: currentSettings
      });
      
      // If monitoring is enabled, restart it with new sensitivity
      if (currentSettings.isEnabled) {
        console.log("🎚️ Sensitivity changed - restarting monitoring with new sensitivity...");
        await sendMessageToServiceWorker({
          type: 'STOP_MONITORING'
        });
        await sendMessageToServiceWorker({
          type: 'START_MONITORING',
          sensitivity: currentSettings.sensitivity
        });
      }
      
      console.log("✅ Sensitivity updated:", currentSettings.sensitivity);
    } catch (error) {
      console.error("❌ Error updating sensitivity:", error);
    }
  });

  // Also save settings when user finishes dragging
  sensitivity.addEventListener('change', async () => {
    try {
      await saveSettings();
      console.log("✅ Sensitivity settings saved");
    } catch (error) {
      console.error("❌ Error saving sensitivity settings:", error);
    }
  });

  // Scolding type selector
  scoldingType.addEventListener('change', async () => {
    try {
      currentSettings.scoldingType = scoldingType.value;
      await saveSettings();
      
      // Send settings update to service worker
      await sendMessageToServiceWorker({
        type: 'UPDATE_SETTINGS',
        settings: currentSettings
      });
      
      console.log("✅ Scolding type updated:", currentSettings.scoldingType);
    } catch (error) {
      console.error("❌ Error updating scolding type:", error);
    }
  });

  // Test button
  testBtn.addEventListener('click', async () => {
    try {
      console.log("🎭 Testing scolding sound...");
      await sendMessageToServiceWorker({
        type: 'LOUD_TALKER_DETECTED'
      });
      console.log("✅ Test scolding triggered");
    } catch (error) {
      console.error("❌ Error testing scolding:", error);
    }
  });

  // Test pause and exit fullscreen button
  testPauseBtn.addEventListener('click', async () => {
    try {
      console.log("⏸️ Testing pause and exit fullscreen...");
      
      // Get the active tab
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (activeTab) {
        // Send spacebar to pause audio/video
        await chrome.tabs.sendMessage(activeTab.id, {
          type: 'SEND_KEYBOARD_EVENT',
          key: ' ',
          description: 'pause audio/video (test)'
        });
        
        // Small delay
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Send escape to exit fullscreen
        await chrome.tabs.sendMessage(activeTab.id, {
          type: 'SEND_KEYBOARD_EVENT',
          key: 'Escape',
          description: 'exit fullscreen (test)'
        });
        
        console.log("✅ Test pause and exit fullscreen triggered");
      } else {
        console.log("⚠️ No active tab found for testing");
      }
    } catch (error) {
      console.error("❌ Error testing pause and exit fullscreen:", error);
    }
  });

  // Debug button
  debugBtn.addEventListener('click', async () => {
    try {
      console.log("🔧 Debug button clicked");
      debugBtn.disabled = true;
      const debugText = debugBtn.querySelector('.debug-text');
      debugText.textContent = 'Checking...';

      // Get current settings and status
      const settingsResponse = await sendMessageToServiceWorker({
        type: 'GET_SETTINGS'
      });

      // Get monitoring status
      const statusResponse = await sendMessageToServiceWorker({
        type: 'GET_MONITORING_STATUS'
      });

      // Get audio level
      const audioResponse = await sendMessageToServiceWorker({
        type: 'GET_AUDIO_LEVEL',
        sensitivity: currentSettings.sensitivity
      });

      console.log("🔧 Debug Information:");
      console.log("   - Settings:", settingsResponse?.settings);
      console.log("   - Monitoring Status:", statusResponse);
      console.log("   - Audio Level:", audioResponse?.audioLevel);
      console.log("   - Threshold:", audioResponse?.threshold);
      console.log("   - Current Settings:", currentSettings);
      console.log("   - Toggle State:", toggle.checked);

      debugText.textContent = 'Debug Complete!';
      setTimeout(() => {
        debugBtn.disabled = false;
        debugText.textContent = 'Debug Audio';
      }, 2000);
    } catch (error) {
      console.error("❌ Error handling debug button click:", error);
      debugBtn.disabled = false;
      const debugText = debugBtn.querySelector('.debug-text');
      debugText.textContent = 'Debug Audio';
    }
  });
}

// Start audio meter updates
function startAudioMeterUpdates() {
  if (audioMeterInterval) {
    clearInterval(audioMeterInterval);
  }

  console.log("🎤 Starting audio meter updates...");

  audioMeterInterval = setInterval(async () => {
    try {
      const response = await sendMessageToServiceWorker({
        type: 'GET_AUDIO_LEVEL',
        sensitivity: currentSettings.sensitivity
      });

      if (response && response.success) {
        updateAudioMeter(response.audioLevel, response.threshold);
        
        // Log audio meter updates occasionally for debugging
        if (Math.random() < 0.05) { // 5% of the time
          console.log(`🎤 Audio Meter Update - Level: ${response.audioLevel?.toFixed(3) || 'N/A'}, Threshold: ${response.threshold?.toFixed(3) || 'N/A'}`);
        }
      } else {
        console.warn("⚠️ Audio meter update failed:", response);
      }
    } catch (error) {
      console.error("❌ Error updating audio meter:", error);
    }
  }, 200); // Reduced from 100ms to 200ms for better performance
}

// Update audio meter display
function updateAudioMeter(level, threshold) {
  try {
    // Update level display
    audioLevel.textContent = level.toFixed(3);
    
    // Update level indicator
    const levelPercent = Math.min(level * 100, 100);
    levelIndicator.style.width = levelPercent + '%';
    
    // Update threshold line
    const thresholdPercent = Math.min(threshold * 100, 100);
    thresholdLine.style.left = thresholdPercent + '%';
    
    // Update meter status
    if (level > threshold) {
      meterStatus.textContent = 'LOUD TALKER DETECTED!';
      meterStatus.className = 'meter-status active';
      levelIndicator.className = 'level-indicator active';
    } else {
      meterStatus.textContent = 'Monitoring audio...';
      meterStatus.className = 'meter-status';
      levelIndicator.className = 'level-indicator';
    }
  } catch (error) {
    console.error("❌ Error updating audio meter:", error);
  }
}

// Clean up interval when popup closes
window.addEventListener('beforeunload', () => {
  if (audioMeterInterval) {
    clearInterval(audioMeterInterval);
  }
});