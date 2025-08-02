// service-worker.js - Mindathe Irikk Service Worker
// Monitors microphone for loud talkers and triggers dramatic scolding actions

let isInitialized = false;
let isListening = false;
let isEnabled = false; // Add enabled state tracking
let offscreenDocument = null;
let scoldingCounter = 0; // Add counter for scolding events

// Validate and sync current state with stored settings
async function validateState() {
  try {
    const result = await chrome.storage.local.get(['settings']);
    const settings = result.settings || { isEnabled: false };
    
    // If state is inconsistent, fix it
    if (isEnabled !== settings.isEnabled) {
      console.log(`🔄 State inconsistency detected: isEnabled=${isEnabled}, settings.isEnabled=${settings.isEnabled}`);
      isEnabled = settings.isEnabled;
      
      // If disabled but still listening, stop monitoring
      if (!isEnabled && isListening) {
        console.log("🛑 Stopping monitoring due to disabled state");
        await stopTalkerMonitoring();
      }
    }
    
    console.log("✅ State validation complete - enabled:", isEnabled, "listening:", isListening);
  } catch (error) {
    console.error("❌ Error validating state:", error);
  }
}

// Initialize extension
async function initializeExtension() {
  if (isInitialized) return;
  
  try {
    console.log("🎭 Mindathe Irikk initializing...");
    
    // Initialize storage with default settings
    const result = await chrome.storage.local.get(['settings']);
    if (!result.settings) {
      await chrome.storage.local.set({
        settings: {
          isEnabled: false,
          sensitivity: 0.5,
          scoldingType: 'classic'
        }
      });
      console.log("✅ Default settings initialized");
    } else {
      // Load current enabled state
      isEnabled = result.settings.isEnabled || false;
      console.log("✅ Loaded current enabled state:", isEnabled);
    }
    
    // Create offscreen document for audio processing
    console.log("📄 Creating offscreen document...");
    await createOffscreenDocument();
    console.log("✅ Offscreen document ready");
    
    isInitialized = true;
    console.log("✅ Mindathe Irikk initialized successfully");
    
    // Validate state after initialization
    await validateState();
  } catch (error) {
    console.error("❌ Error initializing Mindathe Irikk:", error);
    // Don't set isInitialized to false, so we can retry
  }
}

// Create offscreen document for microphone access
async function createOffscreenDocument() {
  try {
    // Check if offscreen document already exists
    const existing = await chrome.offscreen.hasDocument();
    if (existing) {
      console.log("✅ Offscreen document already exists");
      return;
    }
    
    // Create new offscreen document
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['USER_MEDIA'],
      justification: 'Mindathe Irikk needs microphone access to detect loud talkers'
    });
    
    console.log("✅ Offscreen document created for audio capture");
    
    // Wait for the document to be fully loaded
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test communication with the offscreen document
    try {
      const testResponse = await chrome.runtime.sendMessage({
        type: 'TEST_MESSAGE',
        payload: { message: 'Testing offscreen document communication' }
      });
      console.log("✅ Offscreen document communication test successful:", testResponse);
    } catch (testError) {
      console.warn("⚠️ Offscreen document communication test failed, but document was created:", testError);
    }
    
  } catch (error) {
    console.error("❌ Error creating offscreen document:", error);
    throw error; // Re-throw to allow caller to handle
  }
}

// Start monitoring for loud talkers
async function startTalkerMonitoring(sensitivity) {
  if (isListening) {
    console.log("ℹ️ Already monitoring for talkers");
    return;
  }
  
  // Check if extension is enabled before starting
  if (!isEnabled) {
    console.log("🛑 Extension is disabled, not starting monitoring");
    return;
  }
  
  try {
    console.log("🎭 Starting talker monitoring with sensitivity:", sensitivity);
    
    // Reset counter when monitoring starts
    scoldingCounter = 0;
    console.log("🔄 Scolding counter reset to 0");
    
    const response = await sendMessageToOffscreen({
      type: 'START_TALKER_MONITORING',
      sensitivity: sensitivity
    });
    
    if (response && response.success) {
      isListening = true;
      console.log("✅ Talker monitoring started successfully");
    } else {
      console.error("❌ Failed to start talker monitoring:", response?.error);
    }
  } catch (error) {
    console.error("❌ Error starting talker monitoring:", error);
  }
}

// Stop monitoring for loud talkers
async function stopTalkerMonitoring() {
  if (!isListening) {
    console.log("ℹ️ Not currently monitoring");
    return;
  }
  
  try {
    console.log("🛑 Stopping talker monitoring");
    
    const response = await sendMessageToOffscreen({
      type: 'STOP_TALKER_MONITORING'
    });
    
    if (response && response.success) {
      isListening = false;
      console.log("✅ Talker monitoring stopped successfully");
    } else {
      console.error("❌ Failed to stop talker monitoring:", response?.error);
    }
  } catch (error) {
    console.error("❌ Error stopping talker monitoring:", error);
  }
}

// Handle loud talker detected
async function handleLoudTalkerDetected() {
  try {
    // Increment counter
    scoldingCounter++;
    console.log(`🔊 LOUD TALKER DETECTED! (Scolding #${scoldingCounter})`);
    
    // Check if counter reached 10 and redirect
    if (scoldingCounter >= 10) {
      console.log(`🚨 Counter reached ${scoldingCounter}! Redirecting to WikiHow...`);
      
      // Get the active tab to redirect
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (activeTab) {
        try {
          // Redirect to WikiHow page
          await chrome.tabs.update(activeTab.id, {
            url: 'https://www.wikihow.com/Be-Quiet'
          });
          console.log("✅ Redirected to WikiHow Be Quiet page");
          
          // Reset counter after redirect
          scoldingCounter = 0;
          console.log("🔄 Counter reset to 0 after redirect");
          
          // Clear badge
          await chrome.action.setBadgeText({ text: '' });
          
          return; // Exit early, don't continue with normal scolding
        } catch (redirectError) {
          console.error("❌ Error redirecting to WikiHow:", redirectError);
          // Continue with normal scolding if redirect fails
        }
      } else {
        console.log("⚠️ No active tab found for redirect");
      }
    }
    
    // Set badge to show activity and counter
    await chrome.action.setBadgeText({ text: scoldingCounter.toString() });
    await chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
    
    // Get the active tab to send keyboard events
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (activeTab) {
      console.log("🎬 Sending pause and exit fullscreen commands to active tab:", activeTab.url);
      
      try {
        // Send spacebar to pause audio/video
        console.log("⏸️ Sending spacebar to pause...");
        const spacebarResponse = await chrome.tabs.sendMessage(activeTab.id, {
          type: 'SEND_KEYBOARD_EVENT',
          key: ' ',
          description: 'pause audio/video'
        });
        console.log("✅ Spacebar response:", spacebarResponse);
        
        // Small delay to ensure spacebar is processed
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Send escape to exit fullscreen
        console.log("🚪 Sending escape to exit fullscreen...");
        const escapeResponse = await chrome.tabs.sendMessage(activeTab.id, {
          type: 'SEND_KEYBOARD_EVENT',
          key: 'Escape',
          description: 'exit fullscreen'
        });
        console.log("✅ Escape response:", escapeResponse);
        
      } catch (keyboardError) {
        console.error("❌ Error sending keyboard events:", keyboardError);
        console.log("🔍 Tab details:", {
          id: activeTab.id,
          url: activeTab.url,
          title: activeTab.title,
          status: activeTab.status
        });
      }
    } else {
      console.log("⚠️ No active tab found for keyboard events");
    }
    
    // Play scolding sound
    const result = await chrome.storage.local.get(['settings']);
    const settings = result.settings || { scoldingType: 'classic' };
    await sendMessageToOffscreen({ 
      type: 'PLAY_SCOLDING', 
      scoldingType: settings.scoldingType 
    });
    
    // Clear badge after a delay
    setTimeout(async () => {
      try {
        await chrome.action.setBadgeText({ text: '' });
      } catch (error) {
        console.error("❌ Error clearing badge:", error);
      }
    }, 3000);
    
  } catch (error) {
    console.error("❌ Error handling loud talker detected:", error);
  }
}

// Audio generation moved to offscreen document for better compatibility

// Send message to offscreen document
async function sendMessageToOffscreen(message) {
  try {
    // First, ensure offscreen document exists
    const hasDocument = await chrome.offscreen.hasDocument();
    if (!hasDocument) {
      console.log("📄 Offscreen document doesn't exist, creating...");
      await createOffscreenDocument();
      // Wait a moment for the document to initialize
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Try to send the message
    const response = await chrome.runtime.sendMessage(message);
    return response;
  } catch (error) {
    console.error("❌ Error sending message to offscreen:", error);
    
    // If it's a connection error, try to recreate the offscreen document
    if (error.message.includes('Could not establish connection') || 
        error.message.includes('Receiving end does not exist')) {
      console.log("🔄 Connection failed, attempting to recreate offscreen document...");
      try {
        // Close existing document if it exists
        const hasDocument = await chrome.offscreen.hasDocument();
        if (hasDocument) {
          await chrome.offscreen.closeDocument();
        }
        
        // Create new document
        await createOffscreenDocument();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Retry the message
        const retryResponse = await chrome.runtime.sendMessage(message);
        console.log("✅ Message sent successfully after retry");
        return retryResponse;
      } catch (retryError) {
        console.error("❌ Retry failed:", retryError);
        return { success: false, error: retryError.message };
      }
    }
    
    return { success: false, error: error.message };
  }
}

// Handle messages from popup and offscreen
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender, sendResponse);
  return true; // Keep message channel open for async response
});

async function handleMessage(message, sender, sendResponse) {
  try {
    console.log("📨 Service Worker received message:", message.type, "from:", sender.origin);
    
    // Ensure extension is initialized
    if (!isInitialized) {
      await initializeExtension();
    }
    
    switch (message.type) {
      case 'TEST_MESSAGE':
        console.log("✅ Test message received from:", sender.origin);
        sendResponse({ success: true, message: 'Mindathe Irikk is working!' });
        break;
        
      case 'GET_SETTINGS':
        const result = await chrome.storage.local.get(['settings']);
        sendResponse({ success: true, settings: result.settings });
        break;
        
      case 'UPDATE_SETTINGS':
        await chrome.storage.local.set({ settings: message.settings });
        isEnabled = message.settings.isEnabled; // Update enabled state
        console.log("✅ Settings updated, enabled state:", isEnabled);
        sendResponse({ success: true });
        break;
        
      case 'START_MONITORING':
        isEnabled = true; // Set enabled state
        await startTalkerMonitoring(message.sensitivity);
        sendResponse({ success: true });
        break;
        
      case 'STOP_MONITORING':
        isEnabled = false; // Set disabled state
        await stopTalkerMonitoring();
        sendResponse({ success: true });
        break;
        
      case 'LOUD_TALKER_DETECTED':
        await handleLoudTalkerDetected();
        sendResponse({ success: true });
        break;
        
      case 'GET_AUDIO_LEVEL':
        const audioResponse = await sendMessageToOffscreen(message);
        sendResponse(audioResponse);
        break;
        
      case 'GET_MONITORING_STATUS':
        sendResponse({ 
          success: true, 
          isListening,
          isEnabled,
          isInitialized,
          scoldingCounter,
          hasOffscreenDocument: await chrome.offscreen.hasDocument()
        });
        break;
        
      case 'GET_SCOLDING_COUNTER':
        sendResponse({ 
          success: true, 
          counter: scoldingCounter 
        });
        break;
        
      case 'SET_SCOLDING_COUNTER':
        scoldingCounter = message.counter || 0;
        console.log(`🔧 Debug: Counter manually set to ${scoldingCounter}`);
        sendResponse({ 
          success: true, 
          counter: scoldingCounter 
        });
        break;
        
      case 'TEST_REDIRECT':
        console.log("🧪 Testing redirect functionality...");
        scoldingCounter = 10; // Set to trigger redirect
        await handleLoudTalkerDetected();
        sendResponse({ success: true });
        break;
        
      default:
        console.warn("⚠️ Unknown message type:", message.type);
        sendResponse({ success: false, error: 'Unknown message type' });
    }
  } catch (error) {
    console.error("❌ Error handling message:", error);
    sendResponse({ success: false, error: error.message });
  }
}

// Initialize on install and startup
chrome.runtime.onInstalled.addListener(() => {
  console.log("🎭 Mindathe Irikk installed!");
  initializeExtension();
});

chrome.runtime.onStartup.addListener(() => {
  console.log("🎭 Mindathe Irikk starting up!");
  initializeExtension();
});

// Heartbeat to keep service worker alive and validate state
setInterval(async () => {
  console.log("💓 Mindathe Irikk heartbeat - monitoring:", isListening, "enabled:", isEnabled);
  await validateState();
}, 30000);

// Health check for offscreen document
setInterval(async () => {
  try {
    const hasDocument = await chrome.offscreen.hasDocument();
    if (!hasDocument && isListening && isEnabled) {
      console.log("⚠️ Offscreen document missing but monitoring is active, recreating...");
      await createOffscreenDocument();
      if (isListening && isEnabled) {
        // Restart monitoring only if extension is enabled
        const result = await chrome.storage.local.get(['settings']);
        const settings = result.settings || { sensitivity: 0.5 };
        await startTalkerMonitoring(settings.sensitivity);
      }
    }
  } catch (error) {
    console.error("❌ Error in offscreen document health check:", error);
  }
}, 60000); // Check every minute 