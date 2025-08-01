// offscreen.js - Cinema Usher Audio Processing
// Monitors microphone for loud talkers and triggers scolding actions

let mediaStream = null;
let audioContext = null;
let analyser = null;
let dataArray = null;
let intervalId = null;
let isCapturing = false;
let currentAudioLevel = 0;
let lastTalkerTime = 0;
const TALKER_COOLDOWN = 3000; // 3 seconds between scoldings

const statusElement = document.getElementById('status');

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  console.log("🎭 Cinema Usher offscreen document loaded");
  if (statusElement) {
    statusElement.textContent = "Cinema Usher ready";
  }
});

// Ensure status element exists
function updateStatus(message) {
  if (statusElement) {
    statusElement.textContent = message;
  }
}

// Listen for messages from service worker
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    console.log("📨 Offscreen received message:", request.type);
    
    switch (request.type) {
      case 'START_TALKER_MONITORING':
        startTalkerMonitoring(request.sensitivity);
        sendResponse({ success: true });
        break;
        
      case 'STOP_TALKER_MONITORING':
        stopTalkerMonitoring();
        sendResponse({ success: true });
        break;
        
      case 'GET_AUDIO_LEVEL':
        sendResponse({ 
          success: true, 
          audioLevel: currentAudioLevel,
          threshold: 1.0 - (request.sensitivity || 0.5)
        });
        break;
        
      case 'TEST_MESSAGE':
        console.log("✅ Offscreen document received test message:", request.payload);
        sendResponse({ 
          success: true, 
          message: 'Offscreen document is ready!',
          timestamp: Date.now()
        });
        break;
        
      case 'PLAY_SCOLDING':
        playScolding(request.scoldingType);
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

// Start monitoring for loud talkers
async function startTalkerMonitoring(sensitivity) {
  if (isCapturing) {
    console.log("ℹ️ Already monitoring for talkers");
    return;
  }

  try {
    console.log("🎭 Requesting microphone access for talker monitoring...");
    updateStatus("Requesting microphone access...");

    // Request microphone access
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

    // Set up audio analysis
    audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(mediaStream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;

    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    source.connect(analyser);
    isCapturing = true;

    updateStatus("Monitoring for loud talkers...");
    console.log("🎵 Starting talker monitoring with sensitivity:", sensitivity);

    // Start monitoring volume
    intervalId = setInterval(() => {
      if (!isCapturing) return;

      try {
        analyser.getByteTimeDomainData(dataArray);
        const rms = calculateRMS(dataArray);
        currentAudioLevel = rms;

        // Calculate threshold (lower sensitivity = higher threshold needed)
        const threshold = 1.0 - (sensitivity || 0.5);

        // Log more frequently for debugging (every 10th sample instead of 50th)
        if (Math.random() < 0.1) {
          console.log(`🎤 Audio Level: ${rms.toFixed(3)}, Threshold: ${threshold.toFixed(3)}, Capturing: ${isCapturing}`);
        }

        if (rms > threshold) {
          const now = Date.now();
          if (now - lastTalkerTime < TALKER_COOLDOWN) {
            console.log(`⏰ Talker cooldown active, ignoring loud noise (${TALKER_COOLDOWN - (now - lastTalkerTime)}ms remaining)`);
            return;
          }

          lastTalkerTime = now;
          console.log(`🔊 LOUD TALKER DETECTED! RMS: ${rms.toFixed(3)}, Threshold: ${threshold.toFixed(3)}`);
          updateStatus("LOUD TALKER DETECTED!");

          // Send loud talker detected message to service worker
          chrome.runtime.sendMessage({ type: 'LOUD_TALKER_DETECTED' }).then(response => {
            console.log("✅ LOUD_TALKER_DETECTED message sent successfully:", response);
            
            // Reset status after a short delay
            setTimeout(() => {
              updateStatus("Monitoring for loud talkers...");
            }, 2000);
          }).catch(error => {
            console.error("❌ Error sending LOUD_TALKER_DETECTED message:", error);
            setTimeout(() => {
              updateStatus("Monitoring for loud talkers...");
            }, 2000);
          });
        }
      } catch (error) {
        console.error("❌ Error in audio monitoring loop:", error);
        stopTalkerMonitoring();
      }
    }, 100); // Check volume 10 times per second

  } catch (error) {
    console.error("❌ Error starting talker monitoring:", error);
    console.error("❌ Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    let errorMessage = "Unknown error";
    if (error.name === 'NotAllowedError' || error.message.includes('Permission dismissed')) {
      errorMessage = "Microphone permission denied. Please allow microphone access in your browser settings.";
      updateStatus("❌ Microphone permission denied");
    } else if (error.name === 'NotFoundError') {
      errorMessage = "No microphone found. Please connect a microphone and try again.";
      updateStatus("❌ No microphone found");
    } else if (error.name === 'NotReadableError') {
      errorMessage = "Microphone is in use by another application. Please close other apps using the microphone.";
      updateStatus("❌ Microphone in use");
    } else if (error.name === 'AbortError') {
      errorMessage = "Microphone request was aborted. This might be due to browser security restrictions.";
      updateStatus("❌ Microphone request aborted");
    } else if (error.name === 'SecurityError') {
      errorMessage = "Security error accessing microphone. This might be due to HTTPS requirements.";
      updateStatus("❌ Security error");
    } else {
      errorMessage = error.message || "Unknown microphone error";
      updateStatus("❌ Microphone error");
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

// Stop monitoring for loud talkers
function stopTalkerMonitoring() {
  if (!isCapturing) {
    console.log("ℹ️ Not currently monitoring");
    return;
  }

  try {
    console.log("🛑 Stopping talker monitoring...");
    
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }

    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }

    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      mediaStream = null;
    }

    isCapturing = false;
    currentAudioLevel = 0;
    updateStatus("Talker monitoring stopped");
    console.log("✅ Talker monitoring stopped successfully");
  } catch (error) {
    console.error("❌ Error stopping talker monitoring:", error);
  }
}

// Calculate Root Mean Square for volume measurement
function calculateRMS(dataArray) {
  let sum = 0;
  for (let i = 0; i < dataArray.length; i++) {
    const sample = (dataArray[i] - 128) / 128;
    sum += sample * sample;
  }
  return Math.sqrt(sum / dataArray.length);
}

// Manual audio level check for debugging
function checkAudioLevel() {
  if (!isCapturing) {
    console.log("❌ Not currently capturing audio");
    return null;
  }
  
  if (!analyser || !dataArray) {
    console.log("❌ Audio analyser not initialized");
    return null;
  }
  
  try {
    analyser.getByteTimeDomainData(dataArray);
    const rms = calculateRMS(dataArray);
    const threshold = 1.0 - (currentSettings?.sensitivity || 0.5);
    
    console.log(`🎤 Manual Audio Check:`);
    console.log(`   - RMS Level: ${rms.toFixed(3)}`);
    console.log(`   - Threshold: ${threshold.toFixed(3)}`);
    console.log(`   - Above Threshold: ${rms > threshold ? 'YES' : 'NO'}`);
    console.log(`   - Capturing: ${isCapturing}`);
    console.log(`   - Media Stream: ${mediaStream ? 'Active' : 'None'}`);
    console.log(`   - Audio Context: ${audioContext ? 'Active' : 'None'}`);
    
    return { rms, threshold, isAboveThreshold: rms > threshold };
  } catch (error) {
    console.error("❌ Error checking audio level:", error);
    return null;
  }
}

// Make debugging functions available globally
window.cinemaUsherDebug = {
  checkAudioLevel,
  getStatus: () => ({
    isCapturing,
    currentAudioLevel,
    mediaStream: !!mediaStream,
    audioContext: !!audioContext,
    analyser: !!analyser
  }),
  forceStartMonitoring: (sensitivity = 0.5) => startTalkerMonitoring(sensitivity),
  forceStopMonitoring: () => stopTalkerMonitoring(),
  testAudioFile: async (profileType) => {
    console.log(`🧪 Testing audio file for profile: ${profileType}`);
    try {
      const audioContext = new AudioContext();
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      await playAudioFile(profileType, audioContext);
      console.log(`✅ Audio file test successful for ${profileType}`);
    } catch (error) {
      console.error(`❌ Audio file test failed for ${profileType}:`, error);
    }
  },
  listAudioFiles: () => {
    const audioFiles = {
      classic: [
        'audio/profiles/classic/Lal.mp3'
      ],
      dramatic: [
        'audio/profiles/dramatic/gasp.mp3',
        'audio/profiles/dramatic/shush.mp3',
        'audio/profiles/dramatic/hush.mp3'
      ],
      whisper: [
        'audio/profiles/whisper/soft.mp3',
        'audio/profiles/whisper/gentle.mp3',
        'audio/profiles/whisper/calm.mp3'
      ],
      custom1: [
        'audio/profiles/custom/profile1.mp3'
      ],
      custom2: [
        'audio/profiles/custom/profile2.mp3'
      ],
      custom3: [
        'audio/profiles/custom/profile3.mp3'
      ]
    };
    console.log("🎵 Available audio files:", audioFiles);
    return audioFiles;
  }
};

console.log("🔧 Cinema Usher debug functions available:");
console.log("- window.cinemaUsherDebug.checkAudioLevel() - Check current audio level");
console.log("- window.cinemaUsherDebug.getStatus() - Get monitoring status");
console.log("- window.cinemaUsherDebug.forceStartMonitoring(sensitivity) - Force start monitoring");
console.log("- window.cinemaUsherDebug.forceStopMonitoring() - Force stop monitoring");
console.log("- window.cinemaUsherDebug.testAudioFile('classic') - Test audio file loading");
console.log("- window.cinemaUsherDebug.listAudioFiles() - List all audio files");

// Play different types of scolding sounds
function playScolding(scoldingType) {
  try {
    console.log(`🎭 Playing ${scoldingType} scolding...`);
    
    // Create audio context for scolding sounds
    let scoldingContext;
    try {
      scoldingContext = new AudioContext();
      // Resume context if it's suspended (required for user interaction)
      if (scoldingContext.state === 'suspended') {
        scoldingContext.resume();
      }
    } catch (error) {
      console.error("❌ Error creating audio context for scolding:", error);
      return;
    }
    
    // Try to play MP3 file first, fallback to generated sound
    playAudioFile(scoldingType, scoldingContext).catch(error => {
      console.warn(`⚠️ Could not play audio file for ${scoldingType}, falling back to generated sound:`, error);
      playGeneratedSound(scoldingType, scoldingContext);
    });
    
  } catch (error) {
    console.error("❌ Error playing scolding:", error);
  }
}

// Play audio file from profiles
async function playAudioFile(profileType, audioContext) {
  try {
    console.log(`🎵 Attempting to play audio file for profile: ${profileType}`);
    
    // Get random audio file from profile directory
    const audioFiles = getAudioFilesForProfile(profileType);
    if (audioFiles.length === 0) {
      throw new Error(`No audio files found for profile: ${profileType}`);
    }
    
    // Select random audio file
    const randomFile = audioFiles[Math.floor(Math.random() * audioFiles.length)];
    const audioUrl = chrome.runtime.getURL(randomFile);
    
    console.log(`🎵 Loading audio file: ${randomFile}`);
    console.log(`🎵 Audio URL: ${audioUrl}`);
    
    // Fetch and decode audio file
    const response = await fetch(audioUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch audio file: ${response.statusText} (${response.status})`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // Create audio source and play
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start(0);
    
    console.log(`✅ Audio file played successfully: ${randomFile}`);
    
  } catch (error) {
    console.error(`❌ Error playing audio file for ${profileType}:`, error);
    console.log(`🔍 Profile type: ${profileType}`);
    console.log(`🔍 Available profiles: classic, dramatic, whisper, custom1, custom2, custom3`);
    throw error; // Re-throw to trigger fallback
  }
}

// Get audio files for specific profile
function getAudioFilesForProfile(profileType) {
  const audioFiles = {
    classic: [
      'audio/profiles/classic/Lal.mp3'  // Updated to match actual file
    ],
    dramatic: [
      'audio/profiles/dramatic/gasp.mp3',
      'audio/profiles/dramatic/shush.mp3',
      'audio/profiles/dramatic/hush.mp3'
    ],
    whisper: [
      'audio/profiles/whisper/soft.mp3',
      'audio/profiles/whisper/gentle.mp3',
      'audio/profiles/whisper/calm.mp3'
    ],
    custom1: [
      'audio/profiles/custom/profile1.mp3'
    ],
    custom2: [
      'audio/profiles/custom/profile2.mp3'
    ],
    custom3: [
      'audio/profiles/custom/profile3.mp3'
    ]
  };
  
  const files = audioFiles[profileType] || audioFiles.classic;
  console.log(`🎵 Audio files for profile '${profileType}':`, files);
  return files;
}

// Fallback to generated sounds (existing oscillator code)
function playGeneratedSound(scoldingType, audioContext) {
  switch (scoldingType) {
    case 'classic':
      playClassicScolding(audioContext);
      break;
    case 'dramatic':
      playDramaticScolding(audioContext);
      break;
    case 'whisper':
      playWhisperScolding(audioContext);
      break;
    default:
      playClassicScolding(audioContext);
  }
}

// Play classic usher scolding
function playClassicScolding(audioContext) {
  try {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Create a dramatic "SHHH!" sound
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.5);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
    
    console.log("🎭 Classic scolding played!");
  } catch (error) {
    console.error("❌ Error playing classic scolding:", error);
  }
}

// Play dramatic scolding
function playDramaticScolding(audioContext) {
  try {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Create a more dramatic sound
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 1);
    
    gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1);
    
    console.log("🎭 Dramatic scolding played!");
  } catch (error) {
    console.error("❌ Error playing dramatic scolding:", error);
  }
}

// Play whisper scolding
function playWhisperScolding(audioContext) {
  try {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Create a softer, whisper-like sound
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
    
    console.log("🎭 Whisper scolding played!");
  } catch (error) {
    console.error("❌ Error playing whisper scolding:", error);
  }
} 