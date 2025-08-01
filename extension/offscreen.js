navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    analyser.fftSize = 256;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    let lastScreamTime = 0;

    const detectScream = async () => {
      analyser.getByteTimeDomainData(dataArray);
      let sumSquares = 0.0;
      for (const amplitude of dataArray) {
        const normalized = (amplitude / 128.0) - 1.0;
        sumSquares += normalized * normalized;
      }
      const rms = Math.sqrt(sumSquares / dataArray.length);

      const { sensitivity } = await chrome.storage.local.get('sensitivity');
      const threshold = sensitivity ?? 0.5;

      if (rms > threshold) {
        const now = Date.now();
        if (now - lastScreamTime > 2000) { // Add a 2-second cooldown
          lastScreamTime = now;
          chrome.runtime.sendMessage({ type: 'screamDetected' });
        }
      }
      requestAnimationFrame(detectScream);
    };
    detectScream();
  })
  .catch(err => {
    console.error("Microphone access denied:", err);
  });