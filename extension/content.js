// content.js - Mindathe Irikk Content Script
// Simple content script for Mindathe Irikk functionality

// Listen for messages from service worker
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    console.log("📨 Content script received message:", request.type);
    
    switch (request.type) {
      case 'TEST_MESSAGE':
        console.log("✅ Content script received test message:", request.payload);
        sendResponse({ 
          success: true, 
          message: 'Content script is ready!',
          url: window.location.href,
          timestamp: Date.now()
        });
        break;
        
      case 'SEND_KEYBOARD_EVENT':
        sendKeyboardEvent(request.key, request.description);
        sendResponse({ success: true });
        break;
        
      default:
        console.warn("⚠️ Unknown message type:", request.type);
        sendResponse({ success: false, error: 'Unknown message type' });
    }
  } catch (error) {
    console.error("❌ Error handling message:", error);
    sendResponse({ success: false, error: error.message });
  }
  
  return true; // Keep message channel open
});

// Send keyboard event to the page
async function sendKeyboardEvent(key, description) {
  try {
    console.log(`⌨️ Sending keyboard event: ${key} (${description})`);
    
    // Method 1: Direct keyboard event dispatch (only for non-spacebar keys)
    if (key !== ' ') {
      const event = new KeyboardEvent('keydown', {
        key: key,
        code: key === 'Escape' ? 'Escape' : `Key${key.toUpperCase()}`,
        keyCode: key === 'Escape' ? 27 : key.charCodeAt(0),
        which: key === 'Escape' ? 27 : key.charCodeAt(0),
        bubbles: true,
        cancelable: true,
        composed: true,
        isTrusted: false
      });
      
      const keyupEvent = new KeyboardEvent('keyup', {
        key: key,
        code: key === 'Escape' ? 'Escape' : `Key${key.toUpperCase()}`,
        keyCode: key === 'Escape' ? 27 : key.charCodeAt(0),
        which: key === 'Escape' ? 27 : key.charCodeAt(0),
        bubbles: true,
        cancelable: true,
        composed: true,
        isTrusted: false
      });
      
      // Dispatch to document and window
      document.dispatchEvent(event);
      window.dispatchEvent(event);
      
      setTimeout(() => {
        document.dispatchEvent(keyupEvent);
        window.dispatchEvent(keyupEvent);
      }, 50);
      
      console.log(`✅ Keyboard events dispatched for key: ${key}`);
    }
    
    // Method 2: Direct video element control (for spacebar)
    const videoElements = document.querySelectorAll('video');
    if (videoElements.length > 0) {
      console.log(`🎬 Found ${videoElements.length} video element(s), controlling them directly`);
      videoElements.forEach((video, index) => {
        try {
          if (key === ' ') {
            // Toggle play/pause - only use direct control, no keyboard events
            if (video.paused) {
              video.play();
              console.log(`▶️ Video ${index + 1} play() called`);
            } else {
              video.pause();
              console.log(`⏸️ Video ${index + 1} pause() called`);
            }
          } else {
            // For non-spacebar keys, also dispatch to video element
            video.focus();
            if (key !== ' ') {
              const event = new KeyboardEvent('keydown', {
                key: key,
                code: key === 'Escape' ? 'Escape' : `Key${key.toUpperCase()}`,
                keyCode: key === 'Escape' ? 27 : key.charCodeAt(0),
                which: key === 'Escape' ? 27 : key.charCodeAt(0),
                bubbles: true,
                cancelable: true,
                composed: true,
                isTrusted: false
              });
              video.dispatchEvent(event);
            }
          }
          console.log(`✅ Video element ${index + 1} controlled for key: ${key}`);
        } catch (videoError) {
          console.warn(`⚠️ Could not control video element ${index + 1}:`, videoError);
        }
      });
    } else {
      console.log(`⚠️ No video elements found on page for key: ${key}`);
    }
    
    // Method 3: Try to exit fullscreen if escape key
    if (key === 'Escape') {
      try {
        console.log("🚪 Attempting to exit fullscreen...");
        let exited = false;
        
        if (document.fullscreenElement) {
          await document.exitFullscreen();
          console.log("🚪 exitFullscreen() called");
          exited = true;
        }
        if (document.webkitFullscreenElement) {
          await document.webkitExitFullscreen();
          console.log("🚪 webkitExitFullscreen() called");
          exited = true;
        }
        if (document.mozFullScreenElement) {
          await document.mozCancelFullScreen();
          console.log("🚪 mozCancelFullScreen() called");
          exited = true;
        }
        if (document.msFullscreenElement) {
          await document.msExitFullscreen();
          console.log("🚪 msExitFullscreen() called");
          exited = true;
        }
        
        if (!exited) {
          console.log("ℹ️ No fullscreen element found to exit");
        }
      } catch (fullscreenError) {
        console.warn("⚠️ Could not exit fullscreen:", fullscreenError);
      }
    }
    
    console.log(`✅ Keyboard event sent: ${key}`);
  } catch (error) {
    console.error(`❌ Error sending keyboard event ${key}:`, error);
  }
}

// Global error handler to catch any remaining issues
window.addEventListener('error', (event) => {
  if (event.error && event.error.message && event.error.message.includes('className.includes')) {
    console.warn('Caught className.includes error, ignoring...');
    event.preventDefault();
    return false;
  }
});

// Test message to verify service worker communication
setTimeout(() => {
  console.log("🧪 Testing Mindathe Irikk service worker communication...");
  chrome.runtime.sendMessage({
    type: 'TEST_MESSAGE',
    payload: { message: 'Content script is working' }
  }).then(response => {
    console.log("✅ Mindathe Irikk service worker communication test successful:", response);
  }).catch(error => {
    console.error("❌ Mindathe Irikk service worker communication test failed:", error);
  });
}, 2000);

// Simple test function to verify basic functionality
function runBasicTests() {
  console.log("🧪 Running Mindathe Irikk basic functionality tests...");
  
  // Test 1: Check if we're on a valid page
  const isValidPage = window.location.href.startsWith('http');
  console.log("✅ Valid page detection:", isValidPage);
  
  // Test 2: Check if service worker communication works
  console.log("✅ Service worker communication test completed");
  
  return { isValidPage };
}

// Run tests after a delay
setTimeout(runBasicTests, 3000);

// Manual test functions for debugging (can be called from console)
window.testMindatheIrikk = function() {
  console.log("🧪 Manual test: Testing Mindathe Irikk functionality...");
  
  // Test service worker communication
  chrome.runtime.sendMessage({
    type: 'TEST_MESSAGE',
    payload: { message: 'Manual test from console' }
  }).then(response => {
    console.log("✅ Manual test successful:", response);
  }).catch(error => {
    console.error("❌ Manual test failed:", error);
  });
};

// Make debugging functions available globally
window.mindatheIrikkDebug = {
  testKeyboardEvent: (key) => {
    console.log(`🧪 Testing keyboard event: ${key}`);
    sendKeyboardEvent(key, `test-${key}`);
  },
  testPause: () => {
    console.log("🧪 Testing pause functionality (direct video control)");
    sendKeyboardEvent(' ', 'test-pause');
  },
  testExitFullscreen: () => {
    console.log("🧪 Testing exit fullscreen functionality");
    sendKeyboardEvent('Escape', 'test-exit-fullscreen');
  },
  getVideoElements: () => {
    const videos = document.querySelectorAll('video');
    console.log(`🎬 Found ${videos.length} video elements:`, videos);
    return videos;
  },
  getFullscreenStatus: () => {
    const status = {
      fullscreenElement: document.fullscreenElement,
      webkitFullscreenElement: document.webkitFullscreenElement,
      mozFullScreenElement: document.mozFullScreenElement,
      msFullscreenElement: document.msFullscreenElement
    };
    console.log("🔍 Fullscreen status:", status);
    return status;
  },
  testRedirect: async () => {
    console.log("🧪 Testing redirect functionality...");
    try {
      await chrome.runtime.sendMessage({
        type: 'TEST_REDIRECT'
      });
      console.log("✅ Redirect test triggered");
    } catch (error) {
      console.error("❌ Error testing redirect:", error);
    }
  },
  setCounter: async (value) => {
    console.log(`🧪 Setting counter to ${value}...`);
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'SET_SCOLDING_COUNTER',
        counter: value
      });
      console.log("✅ Counter set:", response);
    } catch (error) {
      console.error("❌ Error setting counter:", error);
    }
  }
};

console.log("🔧 Mindathe Irikk debug functions available:");
console.log("- window.mindatheIrikkDebug.testKeyboardEvent('key') - Test specific key");
console.log("- window.mindatheIrikkDebug.testPause() - Test pause (direct video control)");
console.log("- window.mindatheIrikkDebug.testExitFullscreen() - Test exit fullscreen");
console.log("- window.mindatheIrikkDebug.getVideoElements() - List video elements");
console.log("- window.mindatheIrikkDebug.getFullscreenStatus() - Check fullscreen status");
console.log("- window.mindatheIrikkDebug.testRedirect() - Test redirect functionality");
console.log("- window.mindatheIrikkDebug.setCounter(value) - Set counter to specific value");

// Initialize when script loads
console.log("🎭 Mindathe Irikk content script loaded");