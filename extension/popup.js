// popup.js - UI Logic for Scream to Skip Extension

const toggle = document.getElementById('toggle');
const sensitivity = document.getElementById('sensitivity');
const sensitivityValue = document.getElementById('sensitivityValue');
const status = document.getElementById('status');
const statusDot = document.getElementById('statusDot');
const testBtn = document.getElementById('testBtn');
const debugBtn = document.getElementById('debugBtn');

// Audio meter elements
const audioLevel = document.getElementById('audioLevel');
const levelIndicator = document.getElementById('levelIndicator');
const thresholdLine = document.getElementById('thresholdLine');
const meterStatus = document.getElementById('meterStatus');

let audioUpdateInterval = null;
let currentSettings = { isEnabled: true, sensitivity: 0.5 };
let retryCount = 0;
const maxRetries = 3;

// Load and display saved settings when popup opens
function loadSettings() {
  try {
    console.log("🔄 Loading settings...");
    chrome.storage.local.get(['settings'], (result) => {
      try {
        if (chrome.runtime.lastError) {
          console.error("❌ Storage error:", chrome.runtime.lastError);
          // Use defaults if storage fails
          currentSettings = { isEnabled: true, sensitivity: 0.5 };
          toggle.checked = true;
          sensitivity.value = 0.5;
          updateUI();
          startAudioMeterUpdates();
          return;
        }

        const settings = result.settings || {};
        currentSettings = {
          isEnabled: settings.isEnabled !== false,
          sensitivity: settings.sensitivity || 0.5
        };

        toggle.checked = currentSettings.isEnabled;
        sensitivity.value = currentSettings.sensitivity;
        updateUI();
        startAudioMeterUpdates();
        console.log("✅ Settings loaded successfully");
      } catch (error) {
        console.error("❌ Error processing settings:", error);
        // Set defaults if there's an error
        currentSettings = { isEnabled: true, sensitivity: 0.5 };
        toggle.checked = true;
        sensitivity.value = 0.5;
        updateUI();
        startAudioMeterUpdates();
      }
    });
  } catch (error) {
    console.error("❌ Error loading settings:", error);
    // Set defaults if there's an error
    currentSettings = { isEnabled: true, sensitivity: 0.5 };
    toggle.checked = true;
    sensitivity.value = 0.5;
    updateUI();
    startAudioMeterUpdates();
  }
}

// Start audio meter updates
function startAudioMeterUpdates() {
  if (audioUpdateInterval) {
    clearInterval(audioUpdateInterval);
  }

  // Update audio meter every 200ms (reduced frequency)
  audioUpdateInterval = setInterval(async () => {
    try {
      // Get audio level from offscreen document
      const contexts = await chrome.runtime.getContexts({
        contextTypes: ['OFFSCREEN_DOCUMENT']
      });

      if (contexts.length > 0) {
        // Send message directly to offscreen document for audio level
        chrome.runtime.sendMessage({ type: 'GET_AUDIO_LEVEL' }, (response) => {
          if (chrome.runtime.lastError) {
            console.warn("⚠️ Audio level request failed:", chrome.runtime.lastError);
            updateAudioMeter(0, currentSettings.sensitivity, 'No audio data');
            retryCount = 0; // Reset retry count on successful error handling
          } else if (response && response.success) {
            updateAudioMeter(response.audioLevel, currentSettings.sensitivity, response.status);
            retryCount = 0; // Reset retry count on success
          } else {
            updateAudioMeter(0, currentSettings.sensitivity, 'Waiting for audio...');
            retryCount = 0; // Reset retry count on successful response
          }
        });
      } else {
        updateAudioMeter(0, currentSettings.sensitivity, 'Audio not active');
        retryCount = 0; // Reset retry count when no offscreen document
      }
    } catch (error) {
      console.error("❌ Error updating audio meter:", error);
      updateAudioMeter(0, 0.5, 'Error');
      retryCount++;
      
      // Stop retrying if we've exceeded max retries
      if (retryCount >= maxRetries) {
        console.warn("⚠️ Max retries exceeded, stopping audio meter updates");
        clearInterval(audioUpdateInterval);
        audioUpdateInterval = null;
      }
    }
  }, 200);
}

// Update audio meter display
function updateAudioMeter(level, sensitivity, statusText) {
  try {
    // Update level display
    audioLevel.textContent = level.toFixed(3);

    // Update level indicator (0-100%)
    const levelPercent = Math.min(level * 100, 100);
    levelIndicator.style.width = levelPercent + '%';

    // Update threshold line position
    const threshold = 1.0 - sensitivity;
    const thresholdPercent = Math.min(threshold * 100, 100);
    thresholdLine.style.left = thresholdPercent + '%';

    // Update status
    meterStatus.textContent = statusText;

    // Change level indicator color based on level vs threshold
    if (level > threshold) {
      levelIndicator.style.background = '#ef4444'; // Red when above threshold
      meterStatus.style.color = '#ef4444';
    } else if (level > threshold * 0.8) {
      levelIndicator.style.background = '#f59e0b'; // Orange when close to threshold
      meterStatus.style.color = '#f59e0b';
    } else {
      levelIndicator.style.background = 'linear-gradient(90deg, #10b981, #f59e0b, #ef4444)';
      meterStatus.style.color = 'white';
    }
  } catch (error) {
    console.error("❌ Error updating audio meter display:", error);
  }
}

// Update UI based on current settings
function updateUI() {
  try {
    // Update status text and dot
    if (currentSettings.isEnabled) {
      status.textContent = 'Extension is enabled';
      statusDot.className = 'status-dot enabled';
    } else {
      status.textContent = 'Extension is disabled';
      statusDot.className = 'status-dot disabled';
    }

    // Update sensitivity label
    sensitivityValue.textContent = currentSettings.sensitivity.toFixed(1);
  } catch (error) {
    console.error("❌ Error updating UI:", error);
  }
}

// Save settings to storage
function saveSettings() {
  try {
    console.log("💾 Saving settings:", currentSettings);
    chrome.storage.local.set({ settings: currentSettings }, () => {
      if (chrome.runtime.lastError) {
        console.error("❌ Error saving settings:", chrome.runtime.lastError);
      } else {
        console.log("✅ Settings saved successfully");
      }
    });
  } catch (error) {
    console.error("❌ Error in saveSettings:", error);
  }
}

// Event listeners
toggle.addEventListener('change', () => {
  try {
    currentSettings.isEnabled = toggle.checked;
    updateUI();
    saveSettings();
    
    // Send settings update to service worker
    chrome.runtime.sendMessage({
      type: 'SETTINGS_UPDATED',
      payload: currentSettings
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("❌ Error sending settings update:", chrome.runtime.lastError);
      } else {
        console.log("✅ Settings update sent successfully:", response);
      }
    });
  } catch (error) {
    console.error("❌ Error handling toggle change:", error);
  }
});

sensitivity.addEventListener('input', () => {
  try {
    currentSettings.sensitivity = parseFloat(sensitivity.value);
    updateUI();
    saveSettings();
    
    // Send settings update to service worker
    chrome.runtime.sendMessage({
      type: 'SETTINGS_UPDATED',
      payload: currentSettings
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("❌ Error sending settings update:", chrome.runtime.lastError);
      } else {
        console.log("✅ Settings update sent successfully:", response);
      }
    });
  } catch (error) {
    console.error("❌ Error handling sensitivity change:", error);
  }
});

testBtn.addEventListener('click', () => {
  try {
    console.log("🧪 Test button clicked");
    testBtn.disabled = true;
    const testText = testBtn.querySelector('.test-text');
    testText.textContent = 'Testing...';
    
    // Send test command to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        console.error("❌ Error querying tabs:", chrome.runtime.lastError);
        testBtn.disabled = false;
        testText.textContent = 'Test Skip Action';
        return;
      }
      
      if (tabs.length > 0) {
        // First test if skip button exists
        chrome.tabs.sendMessage(tabs[0].id, { type: 'TEST_SKIP_BUTTON' }, (response) => {
          if (chrome.runtime.lastError) {
            console.error("❌ Error sending test message:", chrome.runtime.lastError);
            testText.textContent = 'Error: No response';
          } else if (response && response.success) {
            console.log("✅ Skip button test successful:", response);
            if (response.method === 'direct') {
              testText.textContent = 'Skip button clicked!';
            } else {
              testText.textContent = 'Skip button found';
            }
          } else {
            console.log("❌ Skip button test failed:", response?.reason);
            testText.textContent = response?.reason || 'No skip button found';
          }
          
          setTimeout(() => {
            testBtn.disabled = false;
            testText.textContent = 'Test Skip Action';
          }, 2000);
        });
      } else {
        console.error("❌ No active tab found");
        testText.textContent = 'No active tab';
        setTimeout(() => {
          testBtn.disabled = false;
          testText.textContent = 'Test Skip Action';
        }, 2000);
      }
    });
  } catch (error) {
    console.error("❌ Error handling test button click:", error);
    testBtn.disabled = false;
    const testText = testBtn.querySelector('.test-text');
    testText.textContent = 'Test Skip Action';
  }
});

// Debug button functionality
debugBtn.addEventListener('click', () => {
  try {
    console.log("🔍 Debug button clicked");
    debugBtn.disabled = true;
    const debugText = debugBtn.querySelector('.debug-text');
    debugText.textContent = 'Debugging...';
    
    // Send debug command to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        console.error("❌ Error querying tabs:", chrome.runtime.lastError);
        debugBtn.disabled = false;
        debugText.textContent = 'Debug Page Elements';
        return;
      }
      
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'DEBUG_PAGE_ELEMENTS' }, (response) => {
          if (chrome.runtime.lastError) {
            console.error("❌ Error sending debug message:", chrome.runtime.lastError);
            debugText.textContent = 'Error: No response';
          } else if (response && response.success) {
            console.log("✅ Debug successful:", response.debugResult);
            debugText.textContent = 'Debug complete!';
          } else {
            console.log("❌ Debug failed:", response?.reason);
            debugText.textContent = response?.reason || 'Debug failed';
          }
          
          setTimeout(() => {
            debugBtn.disabled = false;
            debugText.textContent = 'Debug Page Elements';
          }, 2000);
        });
      } else {
        console.error("❌ No active tab found");
        debugText.textContent = 'No active tab';
        setTimeout(() => {
          debugBtn.disabled = false;
          debugText.textContent = 'Debug Page Elements';
        }, 2000);
      }
    });
  } catch (error) {
    console.error("❌ Error handling debug button click:", error);
    debugBtn.disabled = false;
    const debugText = debugBtn.querySelector('.debug-text');
    debugText.textContent = 'Debug Page Elements';
  }
});

// Clean up interval when popup closes
window.addEventListener('beforeunload', () => {
  if (audioUpdateInterval) {
    clearInterval(audioUpdateInterval);
    audioUpdateInterval = null;
  }
});

// Initialize popup
console.log("🚀 Popup initializing...");
loadSettings();