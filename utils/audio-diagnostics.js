/**
 * Audio Diagnostics Utility for StreamTalk
 * Helps diagnose and fix common audio issues in WebRTC connections
 */

export class AudioDiagnostics {
  constructor() {
    this.diagnostics = {
      permissions: null,
      devices: null,
      constraints: null,
      stream: null,
      peerConnections: {},
    };
  }

  /**
   * Comprehensive audio system check
   */
  async performFullDiagnostic() {
    console.log("🔍 Starting comprehensive audio diagnostic...");

    const results = {
      permissions: await this.checkPermissions(),
      devices: await this.checkAudioDevices(),
      constraints: await this.checkConstraints(),
      browser: this.checkBrowserSupport(),
      network: await this.checkNetworkConditions(),
    };

    console.log("📊 Audio Diagnostic Results:", results);
    return results;
  }

  /**
   * Check microphone permissions
   */
  async checkPermissions() {
    try {
      const permissionStatus = await navigator.permissions.query({
        name: "microphone",
      });
      const result = {
        state: permissionStatus.state,
        granted: permissionStatus.state === "granted",
      };

      console.log("🎤 Microphone permission:", result);
      this.diagnostics.permissions = result;
      return result;
    } catch (error) {
      console.error("❌ Permission check failed:", error);
      return { error: error.message, granted: false };
    }
  }

  /**
   * Check available audio devices
   */
  async checkAudioDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(
        (device) => device.kind === "audioinput"
      );
      const audioOutputs = devices.filter(
        (device) => device.kind === "audiooutput"
      );

      const result = {
        inputDevices: audioInputs.length,
        outputDevices: audioOutputs.length,
        devices: {
          inputs: audioInputs.map((device) => ({
            deviceId: device.deviceId,
            label: device.label || "Unknown Microphone",
            groupId: device.groupId,
          })),
          outputs: audioOutputs.map((device) => ({
            deviceId: device.deviceId,
            label: device.label || "Unknown Speaker",
            groupId: device.groupId,
          })),
        },
      };

      console.log("🔊 Audio devices:", result);
      this.diagnostics.devices = result;
      return result;
    } catch (error) {
      console.error("❌ Device enumeration failed:", error);
      return { error: error.message };
    }
  }

  /**
   * Test audio constraints
   */
  async checkConstraints() {
    const constraints = {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: 44100,
      channelCount: 1,
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: constraints,
      });
      const audioTrack = stream.getAudioTracks()[0];

      const result = {
        success: true,
        settings: audioTrack.getSettings(),
        constraints: audioTrack.getConstraints(),
        capabilities: audioTrack.getCapabilities(),
      };

      // Clean up test stream
      stream.getTracks().forEach((track) => track.stop());

      console.log("🎛️ Audio constraints test:", result);
      this.diagnostics.constraints = result;
      return result;
    } catch (error) {
      console.error("❌ Constraints test failed:", error);
      return { error: error.message, success: false };
    }
  }

  /**
   * Check browser WebRTC support
   */
  checkBrowserSupport() {
    const support = {
      getUserMedia: !!(
        navigator.mediaDevices && navigator.mediaDevices.getUserMedia
      ),
      RTCPeerConnection: !!window.RTCPeerConnection,
      webkitRTCPeerConnection: !!window.webkitRTCPeerConnection,
      mozRTCPeerConnection: !!window.mozRTCPeerConnection,
    };

    console.log("🌐 Browser WebRTC support:", support);
    return support;
  }

  /**
   * Check network conditions for WebRTC
   */
  async checkNetworkConditions() {
    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;

    const result = {
      effectiveType: connection?.effectiveType || "unknown",
      downlink: connection?.downlink || "unknown",
      rtt: connection?.rtt || "unknown",
      saveData: connection?.saveData || false,
    };

    console.log("🌍 Network conditions:", result);
    return result;
  }

  /**
   * Monitor audio levels
   */
  async monitorAudioLevels(stream, duration = 5000) {
    if (!stream) {
      console.error("❌ No stream provided for audio monitoring");
      return null;
    }

    return new Promise((resolve) => {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      source.connect(analyser);

      let maxLevel = 0;
      let samples = 0;

      const checkLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const level = Math.max(...dataArray);
        maxLevel = Math.max(maxLevel, level);
        samples++;

        if (samples * 100 < duration) {
          setTimeout(checkLevel, 100);
        } else {
          audioContext.close();
          const result = {
            maxLevel,
            hasAudio: maxLevel > 0,
            averageLevel: maxLevel / samples,
          };
          console.log("📊 Audio level monitoring:", result);
          resolve(result);
        }
      };

      checkLevel();
    });
  }

  /**
   * Test audio output (speakers)
   * @param {string} deviceId - Optional output device ID
   */
  async testSpeakerOutput(deviceId = "default") {
    try {
      // Create a test audio element
      const audio = new Audio();
      audio.preload = "auto";

      // Use a data URL for a short beep sound
      const beepDataUrl =
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAYAzuJ0+/QgTIGHm7A7+OZSA0PVajh8bllHgg2jdXzzn0vBSF+yO/eizEIGGS57OScTgwOUarm7blmGgU5jdTu0H4wBSJ8xu7djjEIF2W57OOaTQwOUann7blmGgU5jdTu0H4wBSJ8xu7djjEIF2W57OOaTQwOUann7blmGgU5jdTu0H4wBSJ8xu7djjEIF2W57OOaTQwOUann7blmGgU5jdTu0H4wBSJ8xu7djjEIF2W57OOaTQwOUann7blmGgU5jdTu0H4wBSJ8xu7djjEIF2W57OOaTQwOUann7blmGgU5jdTu0H4wBSJ8xu7djjEIF2W57OOaTQwOUann7blmGgU5jdTu0H4wBSJ8xu7djjEIF2W57OOaTQwO";
      audio.src = beepDataUrl;

      // Set the audio output device if supported
      if (audio.setSinkId && deviceId !== "default") {
        await audio.setSinkId(deviceId);
      }

      // Test volume levels
      const originalVolume = audio.volume;
      audio.volume = 0.1; // Low volume for testing

      // Play the test sound
      await audio.play();

      // Wait for the sound to finish
      await new Promise((resolve) => {
        audio.onended = resolve;
        setTimeout(resolve, 1000); // Timeout after 1 second
      });

      audio.volume = originalVolume;

      const result = {
        success: true,
        deviceId,
        deviceSupported: !!audio.setSinkId,
        volumeControl: true,
      };

      console.log("🔊 Speaker test result:", result);
      return result;
    } catch (error) {
      console.error("❌ Speaker test failed:", error);
      return {
        error: error.message,
        success: false,
        deviceSupported: false,
      };
    }
  }

  async testEchoCancellation() {
    try {
      // Test with and without echo cancellation
      const withEcho = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true },
      });

      const withoutEcho = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false },
      });

      const result = {
        echoCancellationSupported: true,
        withEcho: withEcho.getAudioTracks()[0].getSettings(),
        withoutEcho: withoutEcho.getAudioTracks()[0].getSettings(),
      };

      // Clean up
      withEcho.getTracks().forEach((track) => track.stop());
      withoutEcho.getTracks().forEach((track) => track.stop());

      console.log("🔄 Echo cancellation test:", result);
      return result;
    } catch (error) {
      console.error("❌ Echo cancellation test failed:", error);
      return { error: error.message, echoCancellationSupported: false };
    }
  }

  /**
   * Generate diagnostic report
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      diagnostics: this.diagnostics,
      recommendations: this.generateRecommendations(),
    };

    console.log("📋 Audio Diagnostic Report:", report);
    return report;
  }

  /**
   * Generate recommendations based on diagnostic results
   */
  generateRecommendations() {
    const recommendations = [];

    if (!this.diagnostics.permissions?.granted) {
      recommendations.push(
        "🎤 Enable microphone permissions in browser settings"
      );
    }

    if (this.diagnostics.devices?.inputDevices === 0) {
      recommendations.push("🔌 Check that a microphone is connected");
    }

    if (!this.diagnostics.constraints?.success) {
      recommendations.push(
        "⚙️ Try using different audio constraints or update browser"
      );
    }

    if (recommendations.length === 0) {
      recommendations.push("✅ Audio system appears to be working correctly");
    }

    return recommendations;
  }
}

/**
 * Quick audio diagnostic function
 */
export const quickAudioCheck = async () => {
  const diagnostics = new AudioDiagnostics();
  return await diagnostics.performFullDiagnostic();
};

/**
 * Audio quality optimizer
 */
export const optimizeAudioSettings = (constraints = {}) => {
  return {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 44100,
    channelCount: 1,
    volume: 1.0,
    // Google-specific constraints for Chrome
    googEchoCancellation: true,
    googAutoGainControl: true,
    googNoiseSuppression: true,
    googHighpassFilter: true,
    googTypingNoiseDetection: true,
    // Merge with custom constraints
    ...constraints,
  };
};

/**
 * Apply audio output device to all audio/video elements
 */
export const applyAudioOutputDevice = async (deviceId) => {
  try {
    const audioElements = document.querySelectorAll('audio, video');
    const results = [];
    
    for (const element of audioElements) {
      if (element.setSinkId) {
        try {
          await element.setSinkId(deviceId);
          results.push({ element: element.tagName, success: true });
        } catch (err) {
          results.push({ element: element.tagName, success: false, error: err.message });
        }
      }
    }
    
    console.log('🔊 Audio output device applied:', results);
    return results;
  } catch (error) {
    console.error('❌ Failed to apply audio output device:', error);
    return [];
  }
};

/**
 * Monitor audio levels in real-time
 */
export const createAudioLevelMonitor = (stream, onLevelChange) => {
  if (!stream) return null;
  
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = audioContext.createAnalyser();
  const source = audioContext.createMediaStreamSource(stream);
  
  analyser.fftSize = 256;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  
  source.connect(analyser);
  
  const monitor = () => {
    analyser.getByteFrequencyData(dataArray);
    const level = Math.max(...dataArray);
    onLevelChange(level);
    requestAnimationFrame(monitor);
  };
  
  monitor();
  
  return () => {
    audioContext.close();
  };
};