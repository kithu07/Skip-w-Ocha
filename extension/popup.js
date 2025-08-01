const toggle = document.getElementById('toggle');
const sensitivity = document.getElementById('sensitivity');

// Load and display saved settings when popup opens
chrome.storage.local.get(['enabled', 'sensitivity'], (data) => {
  toggle.checked = data.enabled ?? true; // Enabled by default
  sensitivity.value = data.sensitivity ?? 0.5; // Default sensitivity
});

// Save settings whenever they are changed
toggle.addEventListener('change', () => {
  chrome.storage.local.set({ enabled: toggle.checked });
});

sensitivity.addEventListener('input', () => {
  chrome.storage.local.set({ sensitivity: parseFloat(sensitivity.value) });
});