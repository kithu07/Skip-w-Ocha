// popup.js - Cinema Usher Popup Interface

// UI elements
const toggle = document.getElementById('toggle');
const sensitivity = document.getElementById('sensitivity');
const sensitivityValue = document.getElementById('sensitivityValue');
const scoldingType = document.getElementById('scoldingType');
const status = document.getElementById('status');
const statusDot = document.getElementById('statusDot');
const counterValue = document.getElementById('counterValue'); // Added for counter display

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
  try {
    console.log("🎭 Mindathe Irikk popup initializing...");
    
    // Load current settings
    await loadSettings();
    
    // Setup event listeners
    setupEventListeners();
    
    // Update UI with current settings
    updateUI();
    
    // Update counter display
    await updateCounter();
    
    // Only start audio meter if extension is enabled
    if (currentSettings.isEnabled) {
      console.log("🎤 Starting audio meter (extension enabled)");
      startAudioMeterUpdates();
    } else {
      console.log("🛑 Audio meter not started (extension disabled)");
    }
    
    console.log("✅ Mindathe Irikk popup initialized");
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

// Update counter display
async function updateCounter() {
  try {
    const response = await sendMessageToServiceWorker({
      type: 'GET_SCOLDING_COUNTER'
    });
    
    if (response && response.success) {
      const counter = response.counter;
      counterValue.textContent = counter.toString();
      
      // Add visual warnings based on counter value
      counterValue.className = 'counter-value'; // Reset classes
      
      if (counter >= 8) {
        counterValue.classList.add('danger');
        console.log("🚨 WARNING: Counter is at dangerous level!");
      } else if (counter >= 5) {
        counterValue.classList.add('warning');
        console.log("⚠️ WARNING: Counter is getting high!");
      }
    } else {
      counterValue.textContent = '0';
      counterValue.className = 'counter-value';
    }
  } catch (error) {
    console.error("❌ Error updating counter:", error);
    counterValue.textContent = '0';
    counterValue.className = 'counter-value';
  }
}

// Update UI based on current settings
function updateUI() {
  toggle.checked = currentSettings.isEnabled;
  sensitivity.value = currentSettings.sensitivity;
  // Update sensitivity value display
  if (sensitivityValue) {
    sensitivityValue.textContent = `${Math.round(currentSettings.sensitivity * 100)}%`;
  }
  scoldingType.value = currentSettings.scoldingType;
  
  // Update status
  if (currentSettings.isEnabled) {
    if (status) status.textContent = 'Extension Active';
    if (statusDot) statusDot.className = 'status-dot enabled';
  } else {
    if (status) status.textContent = 'Extension Disabled';
    if (statusDot) statusDot.className = 'status-dot disabled';
  }
}

// Setup event listeners
function setupEventListeners() {
  // Toggle switch
  if (toggle) {
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
          // Start audio meter updates
          startAudioMeterUpdates();
          // Update counter (should be 0 after reset)
          await updateCounter();
        } else {
          console.log("🛑 Toggle disabled - stopping audio monitoring...");
          await sendMessageToServiceWorker({
            type: 'STOP_MONITORING'
          });
          // Stop audio meter updates
          if (audioMeterInterval) {
            clearInterval(audioMeterInterval);
            audioMeterInterval = null;
            console.log("🛑 Audio meter updates stopped");
          }
        }
        
        console.log("✅ Toggle updated:", currentSettings.isEnabled);
      } catch (error) {
        console.error("❌ Error updating toggle:", error);
      }
    });
  }

  // Sensitivity slider
  if (sensitivity) {
    sensitivity.addEventListener('input', async () => {
      try {
        currentSettings.sensitivity = parseFloat(sensitivity.value);
        // Update sensitivity value display
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
  }

  // Also save settings when user finishes dragging
  if (sensitivity) {
    sensitivity.addEventListener('change', async () => {
      try {
        await saveSettings();
        console.log("✅ Sensitivity settings saved");
      } catch (error) {
        console.error("❌ Error saving sensitivity settings:", error);
      }
    });
  }

  // Scolding type selector
  if (scoldingType) {
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
  }
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
      
      // Update counter periodically (every 10th update = every 2 seconds)
      if (Math.random() < 0.1) {
        await updateCounter();
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
    if (audioLevel) audioLevel.textContent = level.toFixed(3);
    
    // Update level indicator
    if (levelIndicator) {
      const levelPercent = Math.min(level * 100, 100);
      levelIndicator.style.width = levelPercent + '%';
    }
    
    // Update threshold line
    if (thresholdLine) {
      const thresholdPercent = Math.min(threshold * 100, 100);
      thresholdLine.style.left = thresholdPercent + '%';
    }
    
    // Update meter status
    if (meterStatus) {
      if (level > threshold) {
        meterStatus.textContent = 'LOUD TALKER DETECTED!';
        meterStatus.className = 'meter-status active';
        if (levelIndicator) levelIndicator.className = 'level-indicator active';
      } else {
        meterStatus.textContent = 'Monitoring audio...';
        meterStatus.className = 'meter-status';
        if (levelIndicator) levelIndicator.className = 'level-indicator';
      }
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