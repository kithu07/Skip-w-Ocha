// service-worker.js - MV3 Service Worker with Robust Error Handling

let isListening = false;
let isInitialized = false;

// Initialize the extension when it's installed or updated
chrome.runtime.onInstalled.addListener(async () => {
  try {
    await initializeExtension();
  } catch (error) {
    console.error("❌ Failed to initialize extension:", error);
  }
});

// Initialize when service worker starts up
chrome.runtime.onStartup.addListener(async () => {
  try {
    await initializeExtension();
  } catch (error) {
    console.error("❌ Failed to initialize extension on startup:", error);
  }
});

// Initialize extension settings
async function initializeExtension() {
  try {
    if (isInitialized) {
      console.log("ℹ️ Extension already initialized");
      return;
    }

    console.log("🔄 Initializing extension...");
    
    // Set default settings if they don't exist
    const result = await chrome.storage.local.get(['settings']);
    if (!result.settings) {
      await chrome.storage.local.set({
        settings: {
          isEnabled: true,
          sensitivity: 0.5
        },
        adState: {}
      });
      console.log("✅ Default settings created");
    } else {
      console.log("✅ Settings already exist");
    }
    
    isInitialized = true;
    console.log("✅ Extension initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize extension:", error);
    // Don't set isInitialized to false here, let it retry
  }
}

// Main message router with robust error handling
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("📨 Service Worker received message:", message.type, "from tab:", sender.tab?.id, "sender:", sender);
  
  // Ensure extension is initialized
  if (!isInitialized) {
    console.log("🔄 Extension not initialized, initializing now...");
    initializeExtension().then(() => {
      handleMessage(message, sender, sendResponse).catch(error => {
        console.error("❌ Error handling message:", error);
        sendResponse({ success: false, error: error.message });
      });
    }).catch(error => {
      console.error("❌ Failed to initialize extension:", error);
      sendResponse({ success: false, error: "Extension not initialized" });
    });
  } else {
    // Handle messages asynchronously
    handleMessage(message, sender, sendResponse).catch(error => {
      console.error("❌ Error handling message:", error);
      sendResponse({ success: false, error: error.message });
    });
  }
  
  return true; // Keep message channel open for async response
});

async function handleMessage(message, sender, sendResponse) {
  try {
    console.log("🔍 Processing message type:", message.type, "from sender:", sender);
    
    switch (message.type) {
      case 'TEST_MESSAGE':
        console.log("🧪 Received TEST_MESSAGE:", message.payload);
        sendResponse({ success: true, message: "Service worker is working" });
        break;
      case 'AD_STATE_CHANGED':
        console.log("🎯 Processing AD_STATE_CHANGED message...");
        await handleAdStateChange(message.payload, sender.tab.id);
        sendResponse({ success: true });
        break;
      case 'SCREAM_DETECTED':
        console.log("🔊 Processing SCREAM_DETECTED message...");
        // For SCREAM_DETECTED, we don't need the sender tab ID since we'll find the active ad tab
        const result = await handleScreamDetected(null);
        sendResponse(result);
        break;
      case 'SETTINGS_UPDATED':
        console.log("⚙️ Processing SETTINGS_UPDATED message...");
        await handleSettingsUpdate(message.payload);
        sendResponse({ success: true });
        break;
      case 'AUDIO_CAPTURE_ERROR':
        console.log("❌ Processing AUDIO_CAPTURE_ERROR message...");
        await handleAudioError(message.payload);
        sendResponse({ success: true });
        break;
      case 'GET_AUDIO_LEVEL':
        console.log("📊 Forwarding GET_AUDIO_LEVEL to offscreen document...");
        // Forward the message to offscreen document and return the response
        try {
          const response = await sendMessageToOffscreen(message);
          sendResponse(response);
        } catch (error) {
          console.error("❌ Error forwarding GET_AUDIO_LEVEL:", error);
          sendResponse({ success: false, error: error.message });
        }
        break;
      default:
        console.warn("⚠️ Unknown message type:", message.type);
        sendResponse({ success: false, error: "Unknown message type" });
    }
  } catch (error) {
    console.error("❌ Error in handleMessage:", error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleAdStateChange(payload, tabId) {
  try {
    console.log("🎯 Ad state changed:", payload, "Tab:", tabId);
    
    // Get current state with fallbacks
    let result = await chrome.storage.local.get(['settings', 'adState']);
    let settings = result.settings || { isEnabled: true, sensitivity: 0.5 };
    let adState = result.adState || {};
    
    console.log("📊 Current settings:", settings);
    console.log("📊 Current ad state:", adState);
    console.log("📊 Current listening state:", isListening);
    
    // Update ad state with enhanced information
    adState[tabId] = { 
      isAdPlaying: payload.adPlaying,
      skipButtonVisible: payload.skipButtonVisible,
      adContentPresent: payload.adContentPresent
    };
    await chrome.storage.local.set({ adState });

    const anyAdPlaying = Object.values(adState).some(tab => tab.isAdPlaying);
    const anySkipButtonVisible = Object.values(adState).some(tab => tab.skipButtonVisible);
    
    console.log("🎯 Ad analysis:", {
      anyAdPlaying,
      anySkipButtonVisible,
      extensionEnabled: settings.isEnabled,
      currentlyListening: isListening,
      payload: payload
    });

    // Enhanced logic: Keep listening if skip button is visible, even if ad is paused
    if (settings.isEnabled && anyAdPlaying && !isListening) {
      console.log("🎤 Starting audio capture for ad...");
      await startAudioCapture(settings.sensitivity);
    } else if (settings.isEnabled && anySkipButtonVisible && !isListening) {
      console.log("🎤 Starting audio capture (skip button visible, ad may be paused)...");
      await startAudioCapture(settings.sensitivity);
    } else if ((!settings.isEnabled || (!anyAdPlaying && !anySkipButtonVisible)) && isListening) {
      console.log("🛑 Stopping audio capture (no ads or skip buttons visible)...");
      await stopAudioCapture();
    } else {
      console.log("ℹ️ No action needed - conditions not met for audio capture change");
      console.log("ℹ️ Details:", {
        settingsEnabled: settings.isEnabled,
        anyAdPlaying,
        anySkipButtonVisible,
        isListening,
        shouldStart: settings.isEnabled && (anyAdPlaying || anySkipButtonVisible) && !isListening,
        shouldStop: (!settings.isEnabled || (!anyAdPlaying && !anySkipButtonVisible)) && isListening
      });
    }
  } catch (error) {
    console.error("❌ Error in handleAdStateChange:", error);
    // Reset state on error
    isListening = false;
  }
}

async function handleScreamDetected(senderTabId) {
  try {
    console.log("🔊 SCREAM DETECTED! Attempting to skip ad on tab:", senderTabId);
    
    const result = await chrome.storage.local.get('adState');
    const adState = result.adState || {};
    
    // Find tabs with either ads playing OR skip buttons visible
    const activeAdTabs = Object.entries(adState)
      .filter(([id, state]) => state.isAdPlaying || state.skipButtonVisible)
      .map(([id]) => parseInt(id));

    console.log("🎯 Active ad tabs (with skip buttons):", activeAdTabs);

    if (activeAdTabs.length > 0) {
      // Prioritize the currently active tab if it has an ad or skip button
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const activeTab = tabs[0];
      const targetTabId = activeAdTabs.includes(activeTab.id) ? activeTab.id : activeAdTabs[0];

      console.log("🎯 Targeting tab for ad skip:", targetTabId);
      
      // Command the content script to find the button and respond with its location
      return new Promise((resolve) => {
        chrome.tabs.sendMessage(targetTabId, { type: 'EXECUTE_SKIP_ACTION' }, (response) => {
          if (chrome.runtime.lastError) {
            console.error("❌ Error sending skip command:", chrome.runtime.lastError.message);
            resolve({ success: false, skipActionTaken: false, reason: "Communication error" });
            return;
          }
          if (response && response.success) {
            if (response.method === 'direct') {
              console.log("✅ Skip button clicked directly by content script");
              resolve({ success: true, skipActionTaken: true, method: 'direct' });
            } else {
              console.log("✅ Skip button found, triggering fallback click...");
              triggerTrustedClick(targetTabId, response.rect).then(() => {
                resolve({ success: true, skipActionTaken: true, method: 'fallback' });
              }).catch(error => {
                console.error("❌ Fallback click failed:", error);
                resolve({ success: false, skipActionTaken: false, reason: "Click failed" });
              });
            }
          } else {
            console.error("❌ Content script could not find skip button:", response?.reason);
            resolve({ success: false, skipActionTaken: false, reason: response?.reason || "No skip button found" });
          }
        });
      });
    } else {
      console.log("⚠️ No active ad tabs or skip buttons found");
      return { success: false, skipActionTaken: false, reason: "No active ads" };
    }
  } catch (error) {
    console.error("❌ Error in handleScreamDetected:", error);
    return { success: false, skipActionTaken: false, reason: "Error occurred" };
  }
}

async function handleSettingsUpdate(newSettings) {
  try {
    console.log("⚙️ Settings updated:", newSettings);
    await chrome.storage.local.set({ settings: newSettings });
    
    // Re-evaluate ad state in case the extension was just toggled off
    const result = await chrome.storage.local.get('adState');
    const adState = result.adState || {};
    const anyAdPlaying = Object.values(adState).some(tab => tab.isAdPlaying);

    console.log("📊 Re-evaluating after settings change - any ad playing:", anyAdPlaying, "extension enabled:", newSettings.isEnabled);

    if (!newSettings.isEnabled && isListening) {
      console.log("🛑 Stopping audio capture due to settings change...");
      await stopAudioCapture();
    } else if (newSettings.isEnabled && anyAdPlaying && !isListening) {
      console.log("🎤 Starting audio capture due to settings change...");
      // If it was just enabled during an ad, start listening
      const activeTabId = Object.keys(adState).find(tabId => adState[tabId].isAdPlaying);
      if (activeTabId) {
        await handleAdStateChange({ adPlaying: true }, parseInt(activeTabId));
      }
    }
  } catch (error) {
    console.error("❌ Error in handleSettingsUpdate:", error);
  }
}

async function handleAudioError(error) {
  try {
    console.error("❌ Audio capture error:", error);
    console.error("❌ Full error details:", error.fullError);
    
    // Provide specific feedback based on error type
    if (error.errorType === 'NotAllowedError' || error.originalError?.includes('Permission dismissed')) {
      console.error("🎤 MICROPHONE PERMISSION DENIED");
      console.error("📋 To fix this:");
      console.error("1. Click the microphone icon in your browser's address bar");
      console.error("2. Select 'Allow' for microphone access");
      console.error("3. Refresh the YouTube page");
      console.error("4. Try again when an ad appears");
    } else if (error.errorType === 'NotFoundError') {
      console.error("🎤 NO MICROPHONE FOUND");
      console.error("📋 Please connect a microphone and try again");
    } else if (error.errorType === 'NotReadableError') {
      console.error("🎤 MICROPHONE IN USE");
      console.error("📋 Please close other applications using the microphone");
    } else if (error.errorType === 'AbortError') {
      console.error("🎤 MICROPHONE REQUEST ABORTED");
      console.error("📋 This might be due to browser security restrictions");
      console.error("📋 Try refreshing the page and allowing microphone access");
    } else if (error.errorType === 'SecurityError') {
      console.error("🎤 SECURITY ERROR");
      console.error("📋 This might be due to HTTPS requirements");
      console.error("📋 Make sure you're on a secure connection (https://)");
    } else {
      console.error("🎤 UNKNOWN MICROPHONE ERROR");
      console.error("📋 Error type:", error.errorType);
      console.error("📋 Error message:", error.originalError);
    }
    
    await stopAudioCapture();
  } catch (err) {
    console.error("❌ Error in handleAudioError:", err);
  }
}

// Audio Capture Management
async function startAudioCapture(sensitivity) {
  try {
    console.log("🎤 startAudioCapture called with sensitivity:", sensitivity);
    console.log("🎤 Current isListening state:", isListening);
    
    if (isListening) {
      console.log("ℹ️ Already listening for audio");
      return;
    }

    console.log("🎤 Creating offscreen document...");
    // Create offscreen document if it doesn't exist
    await createOffscreenDocument();
    
    console.log("🎤 Sending START_AUDIO_CAPTURE message...");
    // Send start command to offscreen document
    const response = await sendMessageToOffscreen({
      type: 'START_AUDIO_CAPTURE',
      payload: { sensitivity: sensitivity || 0.5 }
    });
    
    if (response && response.success) {
      isListening = true;
      console.log("✅ Audio capture started successfully");
    } else {
      console.error("❌ Failed to start audio capture, response:", response);
      throw new Error("Failed to start audio capture");
    }
  } catch (error) {
    console.error("❌ Error starting audio capture:", error);
    isListening = false;
    throw error; // Re-throw to let caller know it failed
  }
}

async function stopAudioCapture() {
  try {
    console.log("🛑 stopAudioCapture called");
    console.log("🛑 Current isListening state:", isListening);
    
    if (!isListening) {
      console.log("ℹ️ Not currently listening for audio");
      return;
    }

    console.log("🛑 Sending STOP_AUDIO_CAPTURE message...");
    // Send stop command to offscreen document
    const response = await sendMessageToOffscreen({ type: 'STOP_AUDIO_CAPTURE' });
    
    console.log("🛑 Closing offscreen document...");
    // Close offscreen document
    await closeOffscreenDocument();
    
    isListening = false;
    console.log("✅ Audio capture stopped successfully");
  } catch (error) {
    console.error("❌ Error stopping audio capture:", error);
    // Force reset state even on error
    isListening = false;
  }
}

// Offscreen Document Management
async function createOffscreenDocument() {
  try {
    console.log("📄 createOffscreenDocument called");
    
    // Check if an offscreen document is already active
    const contexts = await chrome.runtime.getContexts({
      contextTypes: ['OFFSCREEN_DOCUMENT']
    });

    console.log("📄 Current offscreen contexts:", contexts.length);

    if (contexts.length > 0) {
      console.log("ℹ️ Offscreen document already exists");
      return;
    }

    console.log("📄 Creating new offscreen document...");
    // Create an offscreen document
    await chrome.offscreen.createDocument({
      url: '/offscreen.html',
      reasons: ['USER_MEDIA'],
      justification: 'Microphone access is required to detect user screams for skipping ads.'
    });
    console.log("✅ Offscreen document created successfully");
    
    // Verify it was created
    const newContexts = await chrome.runtime.getContexts({
      contextTypes: ['OFFSCREEN_DOCUMENT']
    });
    console.log("📄 Verification - offscreen contexts after creation:", newContexts.length);
    
  } catch (error) {
    console.error("❌ Failed to create offscreen document:", error);
    throw error;
  }
}

async function closeOffscreenDocument() {
  try {
    if (await chrome.offscreen.hasDocument()) {
      await chrome.offscreen.closeDocument();
      console.log("✅ Offscreen document closed");
    } else {
      console.log("ℹ️ No offscreen document to close");
    }
  } catch (error) {
    console.error("❌ Failed to close offscreen document:", error);
  }
}

async function sendMessageToOffscreen(message) {
  try {
    // Get all contexts to find the offscreen document
    const contexts = await chrome.runtime.getContexts({
      contextTypes: ['OFFSCREEN_DOCUMENT']
    });
    
    if (contexts.length > 0) {
      console.log("📤 Sending message to offscreen document:", message.type);
      // Send message to the offscreen document and return the response
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(message, (response) => {
          if (chrome.runtime.lastError) {
            console.error("❌ Error sending message to offscreen:", chrome.runtime.lastError);
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            console.log("✅ Message sent to offscreen document successfully");
            resolve(response);
          }
        });
      });
    } else {
      console.warn("⚠️ No offscreen document found to send message to");
      throw new Error("No offscreen document available");
    }
  } catch (error) {
    console.error("❌ Error sending message to offscreen:", error);
    throw error;
  }
}

// Trusted Click Implementation using chrome.scripting API (less intrusive)
async function triggerTrustedClick(tabId, rect) {
  console.log("🎯 Triggering click at:", rect);
  
  try {
    // Use scripting API to inject a click script instead of debugger API
    const results = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: (clickX, clickY) => {
        // Create and dispatch a synthetic click event
        const clickEvent = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: clickX,
          clientY: clickY
        });
        
        // Find element at the specified coordinates
        const element = document.elementFromPoint(clickX, clickY);
        if (element) {
          console.log("🎯 Clicking element:", element);
          console.log("🎯 Element details:", {
            tagName: element.tagName,
            className: element.className,
            textContent: element.textContent?.trim(),
            ariaLabel: element.getAttribute('aria-label')
          });
          
          // Try to click the element
          element.dispatchEvent(clickEvent);
          
          // Check if the click was successful by looking for changes
          setTimeout(() => {
            // Check if skip button is still visible (should be gone if click worked)
            const skipButton = document.querySelector('.ytp-ad-skip-button, .ytp-ad-skip-button-modern');
            if (!skipButton) {
              console.log("✅ Click appears to have worked - skip button is gone");
            } else {
              console.log("⚠️ Click may not have worked - skip button still visible");
            }
          }, 100);
          
          return { success: true, element: element.tagName, elementDetails: {
            tagName: element.tagName,
            className: element.className,
            textContent: element.textContent?.trim()
          }};
        } else {
          console.log("❌ No element found at coordinates");
          return { success: false, reason: "No element at coordinates" };
        }
      },
      args: [Math.floor(rect.x + rect.width / 2), Math.floor(rect.y + rect.height / 2)]
    });
    
    if (results && results[0] && results[0].result) {
      const result = results[0].result;
      if (result.success) {
        console.log("✅ Click executed successfully via scripting API:", result);
      } else {
        console.log("❌ Scripting API click failed:", result.reason);
        throw new Error(result.reason);
      }
    } else {
      console.log("❌ Scripting API returned no results");
      throw new Error("No results from scripting API");
    }
    
  } catch (error) {
    console.error("❌ Scripting API click failed:", error);
    
    // Fallback to debugger API if scripting fails
    console.log("🔄 Falling back to debugger API...");
    await triggerTrustedClickFallback(tabId, rect);
  }
}

// Fallback method using debugger API (original implementation)
async function triggerTrustedClickFallback(tabId, rect) {
  console.log("🎯 Fallback: Using debugger API for click");
  
  const debuggee = { tabId: tabId };
  try {
    // Step 1: Attach the debugger to the target tab
    await chrome.debugger.attach(debuggee, "1.3");
    console.log("✅ Debugger attached to tab", tabId);

    // Calculate the center of the button to click
    const clickX = Math.floor(rect.x + rect.width / 2);
    const clickY = Math.floor(rect.y + rect.height / 2);

    // Step 2: Dispatch mouse pressed and released events with minimal interference
    await chrome.debugger.sendCommand(debuggee, "Input.dispatchMouseEvent", {
      type: "mousePressed",
      x: clickX,
      y: clickY,
      button: "left",
      clickCount: 1
    });

    // Small delay to ensure the press is registered
    await new Promise(resolve => setTimeout(resolve, 50));

    await chrome.debugger.sendCommand(debuggee, "Input.dispatchMouseEvent", {
      type: "mouseReleased",
      x: clickX,
      y: clickY,
      button: "left",
      clickCount: 1
    });

    console.log("✅ Trusted click dispatched successfully");

    // Step 3: Immediately detach debugger to minimize interference
    await new Promise(resolve => setTimeout(resolve, 100)); // Brief delay to ensure click completes

  } catch (e) {
    console.error("❌ Debugger command failed:", e);
    if (e.message && e.message.includes("Target closed")) {
      console.warn("⚠️ Target tab was likely closed before the debugger could attach/detach.");
    }
  } finally {
    // Step 4: ALWAYS detach the debugger immediately to restore normal browser operation
    try {
      const targets = await chrome.debugger.getTargets();
      if (targets.some(target => target.tabId === tabId && target.attached)) {
        await chrome.debugger.detach(debuggee);
        console.log("✅ Debugger detached from tab", tabId);
      }
    } catch (detachError) {
      console.error("❌ Failed to detach debugger:", detachError);
    }
  }
}

// Initialize immediately when service worker loads
console.log("🚀 Service worker starting...");
initializeExtension().catch(console.error);

// Keep service worker alive with periodic logging
setInterval(() => {
  console.log("💓 Service worker heartbeat - still alive");
}, 30000); // Every 30 seconds

// Periodic health check for audio capture state
setInterval(async () => {
  try {
    const contexts = await chrome.runtime.getContexts({
      contextTypes: ['OFFSCREEN_DOCUMENT']
    });
    
    const result = await chrome.storage.local.get(['settings', 'adState']);
    const adState = result.adState || {};
    const anyAdPlaying = Object.values(adState).some(tab => tab.isAdPlaying);
    const anySkipButtonVisible = Object.values(adState).some(tab => tab.skipButtonVisible);
    
    console.log("🏥 Audio capture health check:", {
      isListening,
      offscreenContexts: contexts.length,
      anyAdPlaying,
      anySkipButtonVisible,
      shouldBeListening: anyAdPlaying || anySkipButtonVisible
    });
    
    // If we should be listening but aren't, try to restart
    if ((anyAdPlaying || anySkipButtonVisible) && !isListening && contexts.length === 0) {
      console.log("⚠️ Health check: Should be listening but aren't, attempting restart...");
      const settings = result.settings || { isEnabled: true, sensitivity: 0.5 };
      if (settings.isEnabled) {
        await startAudioCapture(settings.sensitivity);
      }
    }
  } catch (error) {
    console.error("❌ Error in health check:", error);
  }
}, 10000); // Every 10 seconds

// Listen for extension icon clicks to keep service worker active
chrome.action.onClicked.addListener((tab) => {
  console.log("🖱️ Extension icon clicked on tab:", tab.id);
}); 