# 🎤 Scream to Skip - YouTube Ad Skipper

A Chrome extension that automatically skips YouTube ads when you scream! 

## Features

- **Automatic Ad Detection**: Detects when YouTube ads start playing
- **Scream Detection**: Uses your microphone to detect when you scream
- **Automatic Skipping**: Clicks the "Skip Ad" button when a scream is detected
- **Adjustable Sensitivity**: Customize how loud you need to scream
- **Easy Toggle**: Enable/disable the extension with one click

## Installation

1. **Download the Extension**
   - Download all files in the `extension/` folder
   - Keep the folder structure intact

2. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `extension/` folder

3. **Grant Permissions**
   - When prompted, allow microphone access
   - The extension needs this to detect your screams

## How to Use

1. **Enable the Extension**
   - Click the extension icon in your Chrome toolbar
   - Toggle the "Enable Extension" switch to ON

2. **Adjust Sensitivity**
   - Use the sensitivity slider to set how loud you need to scream
   - Lower values = more sensitive (quieter screams work)
   - Higher values = less sensitive (need to scream louder)

3. **Watch YouTube**
   - Go to any YouTube video
   - When an ad appears, scream!
   - The ad should automatically skip

## How It Works

1. **Ad Detection**: The extension monitors YouTube for ad containers
2. **Microphone Access**: When an ad is detected, it requests microphone access
3. **Audio Analysis**: Continuously analyzes audio levels using the Web Audio API
4. **Scream Detection**: Compares audio levels against your sensitivity setting
5. **Auto-Skip**: Uses Chrome's debugger API to click the skip button

## Troubleshooting

**Extension not working?**
- Make sure microphone permissions are granted
- Check that the extension is enabled in the popup
- Try adjusting the sensitivity setting

**Not detecting screams?**
- Lower the sensitivity setting
- Make sure your microphone is working
- Try screaming louder or closer to the microphone

**Ads not skipping?**
- Some ads may not have skip buttons
- The extension only works on skippable ads
- Make sure you're on YouTube.com

## Privacy

- The extension only accesses your microphone when ads are detected
- Audio is processed locally and never sent anywhere
- No data is collected or stored beyond your settings

## Technical Details

- **Manifest Version**: 3
- **Permissions**: storage, scripting, debugger, microphone
- **Host Permissions**: YouTube.com only
- **Audio Processing**: Web Audio API with RMS calculation
- **Ad Detection**: DOM mutation observer
- **Button Clicking**: Chrome Debugger API

## Development

This extension is built with vanilla JavaScript and uses:
- Chrome Extension Manifest V3
- Web Audio API for audio processing
- Chrome Debugger API for programmatic clicking
- Chrome Storage API for settings persistence

## License

This project is for educational purposes. Please respect YouTube's terms of service. 