// content.js - MV3 Content Script for YouTube Ad Detection

// Global error handler to catch any remaining issues
window.addEventListener('error', (event) => {
  if (event.error && event.error.message && event.error.message.includes('className.includes')) {
    console.warn('Caught className.includes error, ignoring...');
    event.preventDefault();
    return false;
  }
});

// State to prevent sending redundant messages
let isAdPlaying = false;
let currentUrl = window.location.href;
let observer = null;

// Test message to verify service worker communication
setTimeout(() => {
  console.log("🧪 Testing service worker communication...");
  chrome.runtime.sendMessage({
    type: 'TEST_MESSAGE',
    payload: { message: 'Content script is working' }
  }).then(response => {
    console.log("✅ Service worker communication test successful:", response);
  }).catch(error => {
    console.error("❌ Service worker communication test failed:", error);
  });
}, 2000);

// Function to check the current ad state and notify the service worker
const checkAdState = () => {
  try {
    // Enhanced ad detection with multiple methods
    const skipButton = document.querySelector('.ytp-ad-skip-button, .ytp-ad-skip-button-modern');
    const adOverlay = document.querySelector('.ytp-ad-player-overlay');
    const adModule = document.querySelector('.video-ads.ytp-ad-module');
    
    // PRIORITY: If skip button is visible, consider ad as "active" regardless of play state
    // This allows screaming to work even when ad is paused
    const skipButtonVisible = !!skipButton;
    const adContentPresent = !!(adOverlay && adOverlay.innerHTML.length > 0) || !!(adModule && adModule.children.length > 0);
    
    // Consider ad "active" if skip button is visible OR ad content is present
    const currentlyPlaying = skipButtonVisible || adContentPresent;

    console.log('Ad detection check:', {
      skipButton: skipButtonVisible,
      adOverlay: !!(adOverlay && adOverlay.innerHTML.length > 0),
      adModule: !!(adModule && adModule.children.length > 0),
      currentlyPlaying,
      wasPlaying: isAdPlaying,
      skipButtonVisible,
      adContentPresent
    });

    if (currentlyPlaying !== isAdPlaying) {
      isAdPlaying = currentlyPlaying;
      console.log(`🎯 AD STATE CHANGED: ${isAdPlaying ? 'AD STARTED' : 'AD ENDED'}`);
      
      // Send message to service worker
      chrome.runtime.sendMessage({
        type: 'AD_STATE_CHANGED',
        payload: { 
          adPlaying: isAdPlaying,
          skipButtonVisible: skipButtonVisible,
          adContentPresent: adContentPresent
        }
      }).then(response => {
        console.log('✅ AD_STATE_CHANGED message sent successfully:', response);
      }).catch(error => {
        console.error("❌ Error sending AD_STATE_CHANGED message:", error);
      });
    }
  } catch (error) {
    console.error("Error in checkAdState:", error);
  }
};

// Function to initialize ad detection
function initializeAdDetection() {
  try {
    console.log("🔄 Initializing ad detection...");
    
    // Clean up existing observer if any
    if (observer) {
      observer.disconnect();
      observer = null;
    }

    // The target node to observe for mutations (the main video player)
    const targetNode = document.getElementById('movie_player');

if (targetNode) {
      console.log("✅ YouTube player found, starting ad detection...");
      
      // Create an observer instance linked to a callback function
      observer = new MutationObserver((mutationsList, observer) => {
        try {
          // Check for any relevant mutations
          let shouldCheck = false;
          for (const mutation of mutationsList) {
            if (mutation.type === 'childList' || mutation.type === 'attributes') {
              shouldCheck = true;
              break;
            }
          }
          
          if (shouldCheck) {
            checkAdState();
          }
        } catch (error) {
          console.error("Error in mutation observer:", error);
        }
      });

      // Configuration of the observer
      const config = {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'hidden'] // Observe changes that might hide/show ad elements
      };

      // Start observing the target node for configured mutations
      observer.observe(targetNode, config);

      // Initial check in case an ad is already playing on page load
      checkAdState();
    } else {
      console.log("❌ YouTube player not found, will retry...");
      // Retry after a short delay in case the player hasn't loaded yet
      setTimeout(initializeAdDetection, 1000);
    }
  } catch (error) {
    console.error("Error initializing ad detection:", error);
  }
}

// Function to check if URL has changed (for SPA navigation)
function checkUrlChange() {
  try {
    const newUrl = window.location.href;
    if (newUrl !== currentUrl) {
      console.log("🔄 URL changed, reinitializing ad detection...");
      currentUrl = newUrl;
      isAdPlaying = false; // Reset ad state
      initializeAdDetection();
    }
  } catch (error) {
    console.error("Error checking URL change:", error);
  }
}

// Listen for messages from the service worker
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    if (request.type === 'EXECUTE_SKIP_ACTION') {
      console.log('🎯 Received EXECUTE_SKIP_ACTION command');
      
      // Use retry mechanism to find skip button
      findSkipButtonWithRetry().then(skipButton => {
        if (skipButton) {
          const rect = skipButton.getBoundingClientRect();
          console.log('✅ Found skip button at:', rect);
          
          // Try to click the button directly first (most reliable)
          try {
            console.log('🎯 Attempting direct click on skip button...');
            skipButton.click();
            console.log('✅ Direct click successful');
            sendResponse({
              success: true,
              rect: rect,
              method: 'direct'
            });
          } catch (clickError) {
            console.log('⚠️ Direct click failed, providing coordinates for fallback:', clickError);
            sendResponse({
              success: true,
              rect: rect,
              method: 'coordinates'
            });
          }
        } else {
          console.log('❌ Skip button not found after retries');
          sendResponse({ success: false, reason: 'Skip button not found after retries.' });
        }
      });
      
      return true; // Keep message channel open for async response
    } else if (request.type === 'TEST_SKIP_BUTTON') {
      console.log('🧪 Received TEST_SKIP_BUTTON command');
      
      // Use retry mechanism for test as well
      findSkipButtonWithRetry().then(skipButton => {
        if (skipButton) {
          const testResult = testSkipButtonFunctionality();
          sendResponse(testResult);
        } else {
          sendResponse({ success: false, reason: 'No skip button found after retries' });
        }
      });
      
      return true; // Keep message channel open for async response
    } else if (request.type === 'DEBUG_PAGE_ELEMENTS') {
      console.log('🔍 Received DEBUG_PAGE_ELEMENTS command');
      const debugResult = debugPageElements();
      sendResponse({ success: true, debugResult });
      return true;
    }
  } catch (error) {
    console.error("Error handling message:", error);
    sendResponse({ success: false, reason: 'Error processing request.' });
    return true;
  }
});

// Function to find the skip button using multiple selectors for robustness
function findSkipButton() {
  try {
    const selectors = [
      // Modern YouTube skip button selectors
      '.ytp-ad-skip-button-modern',
      '.ytp-ad-skip-button',
      '.ytp-ad-skip-button-container button',
      '.ytp-ad-skip-button-slot button',
      
      // Generic skip button selectors
      '[aria-label*="Skip"]',
      '[aria-label*="skip"]',
      'button[aria-label*="Skip"]',
      'button[aria-label*="skip"]',
      
      // Additional selectors for different ad types
      '.ytp-ad-skip-button-container',
      '.ytp-ad-skip-button-slot',
      '[data-target-id="skip-button"]',
      '[data-target-id="skip-button-modern"]',
      
      // Text-based selectors
      'button:contains("Skip")',
      'button:contains("skip")',
      '[role="button"]:contains("Skip")',
      
      // Shadow DOM and iframe selectors (if needed)
      'ytd-player * .ytp-ad-skip-button',
      'ytd-player * [aria-label*="Skip"]'
    ];
    
    console.log('🔍 Searching for skip button with selectors...');
    
    // First, try standard selectors
    for (const selector of selectors) {
      try {
        const button = document.querySelector(selector);
        if (button) {
          console.log('✅ Found skip button with selector:', selector);
          console.log('✅ Button details:', {
            tagName: button.tagName,
            className: button.className,
            id: button.id,
            textContent: button.textContent?.trim(),
            ariaLabel: button.getAttribute('aria-label'),
            visible: button.offsetParent !== null,
            rect: button.getBoundingClientRect()
          });
          return button;
        }
      } catch (error) {
        console.log('⚠️ Selector failed:', selector, error);
      }
    }
    
    // If standard selectors fail, try more aggressive search
    console.log('🔍 Standard selectors failed, trying aggressive search...');
    
    // Search all buttons for skip-related text
    const allButtons = document.querySelectorAll('button');
    for (const button of allButtons) {
      const text = button.textContent?.toLowerCase() || '';
      const ariaLabel = button.getAttribute('aria-label')?.toLowerCase() || '';
      
      if (text.includes('skip') || ariaLabel.includes('skip')) {
        console.log('✅ Found skip button via text search:', {
          tagName: button.tagName,
          className: button.className,
          textContent: button.textContent?.trim(),
          ariaLabel: button.getAttribute('aria-label'),
          visible: button.offsetParent !== null,
          rect: button.getBoundingClientRect()
        });
        return button;
      }
    }
    
    // Search for any element with skip-related attributes
    const skipElements = document.querySelectorAll('[aria-label*="Skip"], [aria-label*="skip"]');
    for (const element of skipElements) {
      if (element.tagName === 'BUTTON' || element.onclick || element.getAttribute('role') === 'button') {
        console.log('✅ Found skip button via attribute search:', {
          tagName: element.tagName,
          className: element.className,
          textContent: element.textContent?.trim(),
          ariaLabel: element.getAttribute('aria-label'),
          visible: element.offsetParent !== null,
          rect: element.getBoundingClientRect()
        });
        return element;
      }
    }
    
    console.log('❌ No skip button found with any method');
    return null;
  } catch (error) {
    console.error("Error finding skip button:", error);
    return null;
  }
}

// Comprehensive test function for skip button functionality
function testSkipButtonFunctionality() {
  console.log('🧪 Testing skip button functionality...');
  
  // Test 1: Find skip button
  const skipButton = findSkipButton();
  if (!skipButton) {
    console.log('❌ TEST FAILED: No skip button found');
    return { success: false, reason: 'No skip button found' };
  }
  
  // Test 2: Check button properties
  const rect = skipButton.getBoundingClientRect();
  console.log('✅ Button found at:', rect);
  
  // Test 3: Check if button is visible and clickable
  if (rect.width === 0 || rect.height === 0) {
    console.log('❌ TEST FAILED: Button has zero dimensions');
    return { success: false, reason: 'Button has zero dimensions' };
  }
  
  if (skipButton.offsetParent === null) {
    console.log('❌ TEST FAILED: Button is not visible');
    return { success: false, reason: 'Button is not visible' };
  }
  
  // Test 4: Try to click the button
  try {
    console.log('🎯 Attempting to click skip button...');
    skipButton.click();
    console.log('✅ TEST PASSED: Direct click successful');
    return { success: true, method: 'direct', rect: rect };
  } catch (clickError) {
    console.log('⚠️ Direct click failed:', clickError);
    console.log('✅ TEST PARTIAL: Button found but direct click failed, coordinates available');
    return { success: true, method: 'coordinates', rect: rect, error: clickError.message };
  }
}

// Enhanced skip button finder with retry mechanism
function findSkipButtonWithRetry(maxRetries = 5, delay = 500) {
  return new Promise((resolve) => {
    let attempts = 0;
    
    const tryFind = () => {
      attempts++;
      console.log(`🔍 Attempt ${attempts}/${maxRetries} to find skip button...`);
      
      const skipButton = findSkipButton();
      if (skipButton) {
        console.log(`✅ Found skip button on attempt ${attempts}`);
        resolve(skipButton);
        return;
      }
      
      if (attempts >= maxRetries) {
        console.log('❌ Failed to find skip button after all attempts');
        resolve(null);
        return;
      }
      
      console.log(`⏰ Retrying in ${delay}ms...`);
      setTimeout(tryFind, delay);
    };
    
    tryFind();
  });
}

// Debug function to help identify page elements
function debugPageElements() {
  console.log('🔍 DEBUG: Analyzing page elements...');
  
  // Check for common ad-related elements
  const adElements = {
    'ytp-ad-skip-button': document.querySelectorAll('.ytp-ad-skip-button'),
    'ytp-ad-skip-button-modern': document.querySelectorAll('.ytp-ad-skip-button-modern'),
    'ytp-ad-skip-button-container': document.querySelectorAll('.ytp-ad-skip-button-container'),
    'ytp-ad-skip-button-slot': document.querySelectorAll('.ytp-ad-skip-button-slot'),
    'ytp-ad-player-overlay': document.querySelectorAll('.ytp-ad-player-overlay'),
    'video-ads.ytp-ad-module': document.querySelectorAll('.video-ads.ytp-ad-module')
  };
  
  console.log('📊 Ad elements found:', adElements);
  
  // Check all buttons for skip-related content
  const allButtons = document.querySelectorAll('button');
  const skipRelatedButtons = [];
  
  for (const button of allButtons) {
    const text = button.textContent?.toLowerCase() || '';
    const ariaLabel = button.getAttribute('aria-label')?.toLowerCase() || '';
    const className = button.className || '';
    
    if (text.includes('skip') || ariaLabel.includes('skip') || className.includes('skip')) {
      skipRelatedButtons.push({
        element: button,
        textContent: button.textContent?.trim(),
        ariaLabel: button.getAttribute('aria-label'),
        className: button.className,
        visible: button.offsetParent !== null,
        rect: button.getBoundingClientRect()
      });
    }
  }
  
  console.log('📊 Skip-related buttons found:', skipRelatedButtons);
  
  // Check for any elements with skip-related attributes
  const skipElements = document.querySelectorAll('[aria-label*="Skip"], [aria-label*="skip"]');
  console.log('📊 Elements with skip attributes:', Array.from(skipElements).map(el => ({
    tagName: el.tagName,
    className: el.className,
    ariaLabel: el.getAttribute('aria-label'),
    textContent: el.textContent?.trim(),
    visible: el.offsetParent !== null
  })));
  
  return { adElements, skipRelatedButtons, skipElements: Array.from(skipElements) };
}

// Initialize when script loads
console.log("🚀 Content script loaded, initializing...");

// Send immediate test message to verify service worker communication
chrome.runtime.sendMessage({
  type: 'TEST_MESSAGE',
  payload: { message: 'Content script just loaded' }
}).then(response => {
  console.log("✅ Immediate service worker test successful:", response);
}).catch(error => {
  console.error("❌ Immediate service worker test failed:", error);
});

initializeAdDetection();

// Check for URL changes periodically (for SPA navigation)
setInterval(checkUrlChange, 1000);

// Also listen for popstate events (back/forward navigation)
window.addEventListener('popstate', () => {
  setTimeout(checkUrlChange, 100);
});

// Listen for pushstate/replacestate events (programmatic navigation)
const originalPushState = history.pushState;
const originalReplaceState = history.replaceState;

history.pushState = function(...args) {
  try {
    originalPushState.apply(history, args);
    setTimeout(checkUrlChange, 100);
  } catch (error) {
    console.error("Error in pushState:", error);
  }
};

history.replaceState = function(...args) {
  try {
    originalReplaceState.apply(history, args);
    setTimeout(checkUrlChange, 100);
  } catch (error) {
    console.error("Error in replaceState:", error);
  }
};