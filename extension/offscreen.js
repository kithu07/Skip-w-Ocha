// offscreen.js - Audio Processing for MV3 Extension

let audioContext;
let mediaStream;
let analyser;
let dataArray;
let intervalId;
let isCapturing = false;
let currentAudioLevel = 0;
let currentStatus = "Waiting for audio...";
let lastScreamTime = 0;
const SCREAM_COOLDOWN = 2000; // 2 seconds cooldown between scream attempts

const statusElement = document.getElementById('status');

// Listen for messages from the service worker
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    console.log("📨 Offscreen received message:", message.type);
    
    if (message.type === 'START_AUDIO_CAPTURE') {
      console.log("🎤 Starting audio capture with sensitivity:", message.payload.sensitivity);
      startAudioCapture(message.payload.sensitivity).catch(console.error);
      sendResponse({ success: true });
    } else if (message.type === 'STOP_AUDIO_CAPTURE') {
      console.log("🛑 Stopping audio capture");
      stopAudioCapture();
      sendResponse({ success: true });
    } else if (message.type === 'GET_AUDIO_LEVEL') {
      console.log("📊 Returning audio level:", currentAudioLevel, "status:", currentStatus);
      // Return current audio level and status
      sendResponse({
        success: true,
        audioLevel: currentAudioLevel,
        status: currentStatus
      });
    }
  } catch (error) {
    console.error("❌ Error handling message in offscreen:", error);
    sendResponse({ success: false, error: error.message });
  }
  
  return true; // Keep message channel open for async response
});

async function startAudioCapture(sensitivity) {
  if (isCapturing) {
    console.log("ℹ️ Already capturing audio");
    return;
  }

  try {
    console.log("🎤 Requesting microphone access...");
    console.log("🎤 Current permissions state:", await navigator.permissions.query({ name: 'microphone' }));
    statusElement.textContent = "Requesting microphone access...";
    currentStatus = "Requesting microphone access...";
    
    // Try to get user media with more detailed error handling
    console.log("🎤 Calling getUserMedia...");
    mediaStream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      } 
    });
    console.log("✅ Microphone access granted");
    console.log("🎤 Media stream tracks:", mediaStream.getTracks().map(track => ({
      kind: track.kind,
      enabled: track.enabled,
      muted: track.muted,
      readyState: track.readyState
    })));

    audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(mediaStream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048; // Higher FFT size for better analysis

    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    source.connect(analyser);
    isCapturing = true;

    statusElement.textContent = "Listening for screams...";
    currentStatus = "Listening for screams...";
    console.log("🎵 Starting audio analysis with sensitivity:", sensitivity);

    // Start monitoring volume
    intervalId = setInterval(() => {
      if (!isCapturing) return;
      
      try {
        analyser.getByteTimeDomainData(dataArray);
        const rms = calculateRMS(dataArray);
        currentAudioLevel = rms; // Store current level for popup

        // The sensitivity from the slider (0.1-1.0) needs to be mapped
        // to the RMS scale. Lower sensitivity = higher threshold needed
        const threshold = 1.0 - sensitivity; // Invert the sensitivity logic

        // Log every 50th sample to avoid spam
        if (Math.random() < 0.02) {
          console.log(`Audio Level: ${rms.toFixed(3)}, Threshold: ${threshold.toFixed(3)}`);
        }

        if (rms > threshold) {
          const now = Date.now();
          if (now - lastScreamTime < SCREAM_COOLDOWN) {
            console.log(`⏰ Scream cooldown active, ignoring scream (${SCREAM_COOLDOWN - (now - lastScreamTime)}ms remaining)`);
            return; // Skip this scream due to cooldown
          }
          
          lastScreamTime = now;
          console.log(`🔊 SCREAM DETECTED! RMS: ${rms.toFixed(3)}, Threshold: ${threshold.toFixed(3)}`);
          statusElement.textContent = "SCREAM DETECTED!";
          currentStatus = "SCREAM DETECTED!";
          
          // Send scream detected message to service worker
          chrome.runtime.sendMessage({ type: 'SCREAM_DETECTED' }).then(response => {
            console.log("✅ SCREAM_DETECTED message sent successfully:", response);
            
            // Check if the scream actually resulted in a successful skip action
            if (response && response.success && response.skipActionTaken) {
              console.log("✅ Skip action successful, stopping audio capture");
              // Only stop listening if a skip action was actually performed
              setTimeout(() => {
                stopAudioCapture();
              }, 500);
            } else {
              console.log("⚠️ Scream detected but no skip action taken, continuing to listen...");
              // Reset status and continue listening
              setTimeout(() => {
                statusElement.textContent = "Listening for screams...";
                currentStatus = "Listening for screams...";
              }, 1000);
            }
          }).catch(error => {
            console.error("❌ Error sending SCREAM_DETECTED message:", error);
            // Reset status and continue listening on error
            setTimeout(() => {
              statusElement.textContent = "Listening for screams...";
              currentStatus = "Listening for screams...";
            }, 1000);
          });
        }
      } catch (error) {
        console.error("❌ Error in audio monitoring loop:", error);
        stopAudioCapture();
      }
    }, 100); // Check volume 10 times per second

  } catch (error) {
    console.error("❌ Error capturing audio:", error);
    console.error("❌ Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    let errorMessage = "Unknown error";
    if (error.name === 'NotAllowedError' || error.message.includes('Permission dismissed')) {
      errorMessage = "Microphone permission denied. Please allow microphone access in your browser settings.";
      statusElement.textContent = "❌ Microphone permission denied";
      currentStatus = "Microphone permission denied";
    } else if (error.name === 'NotFoundError') {
      errorMessage = "No microphone found. Please connect a microphone and try again.";
      statusElement.textContent = "❌ No microphone found";
      currentStatus = "No microphone found";
    } else if (error.name === 'NotReadableError') {
      errorMessage = "Microphone is in use by another application. Please close other apps using the microphone.";
      statusElement.textContent = "❌ Microphone in use";
      currentStatus = "Microphone in use";
    } else if (error.name === 'AbortError') {
      errorMessage = "Microphone request was aborted. This might be due to browser security restrictions.";
      statusElement.textContent = "❌ Microphone request aborted";
      currentStatus = "Microphone request aborted";
    } else if (error.name === 'SecurityError') {
      errorMessage = "Security error accessing microphone. This might be due to HTTPS requirements.";
      statusElement.textContent = "❌ Security error";
      currentStatus = "Security error";
    } else {
      errorMessage = error.message || "Unknown microphone error";
      statusElement.textContent = "❌ Microphone error";
      currentStatus = "Microphone error";
    }
    
    // Inform the service worker of the failure
    chrome.runtime.sendMessage({ 
      type: 'AUDIO_CAPTURE_ERROR', 
      payload: { 
        message: errorMessage,
        errorType: error.name,
        originalError: error.message,
        fullError: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      } 
    }).then(response => {
      console.log("✅ AUDIO_CAPTURE_ERROR message sent successfully:", response);
    }).catch(err => {
      console.error("❌ Error sending AUDIO_CAPTURE_ERROR message:", err);
    });
  }
}

function stopAudioCapture() {
  console.log("🛑 Stopping audio capture");
  isCapturing = false;
  currentAudioLevel = 0;
  currentStatus = "Audio capture stopped";
  
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  
  if (mediaStream) {
    try {
      mediaStream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error("❌ Error stopping media stream tracks:", error);
    }
    mediaStream = null;
  }
  
  if (audioContext) {
    try {
      audioContext.close();
    } catch (error) {
      console.error("❌ Error closing audio context:", error);
    }
    audioContext = null;
  }
  
  statusElement.textContent = "Audio capture stopped";
  console.log("✅ Audio capture stopped");
}

function calculateRMS(dataArray) {
  try {
    let sumOfSquares = 0;
    for (let i = 0; i < dataArray.length; i++) {
      // The data is an unsigned 8-bit integer (0-255), where 128 is silence.
      // We normalize it to a range of -128 to 127.
      const normalizedSample = dataArray[i] - 128;
      sumOfSquares += normalizedSample * normalizedSample;
    }
    const meanSquare = sumOfSquares / dataArray.length;
    const rms = Math.sqrt(meanSquare);
    
    // Normalize RMS to 0-1 range for easier threshold comparison
    return Math.min(rms / 128, 1.0);
  } catch (error) {
    console.error("❌ Error calculating RMS:", error);
    return 0;
  }
}

console.log("🚀 Offscreen document loaded and ready"); 