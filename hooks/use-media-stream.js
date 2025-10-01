import { useState, useEffect, useRef } from "react";
import { quickAudioCheck, optimizeAudioSettings, applyAudioOutputDevice } from "@/utils/audio-diagnostics";

const useMediaStream = () => {
  const [state, setState] = useState(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [error, setError] = useState(null);
  const [permissions, setPermissions] = useState({
    audio: false,
    video: false,
  });
  const [audioDevices, setAudioDevices] = useState({ inputs: [], outputs: [] });
  const [selectedAudioInput, setSelectedAudioInput] = useState('default');
  const [selectedAudioOutput, setSelectedAudioOutput] = useState('default');
  const isStreamSet = useRef(false);

  // Enumerate audio devices
  const updateAudioDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const inputs = devices.filter(device => device.kind === 'audioinput');
      const outputs = devices.filter(device => device.kind === 'audiooutput');
      
      setAudioDevices({ inputs, outputs });
      console.log('📱 Audio devices updated:', { inputs: inputs.length, outputs: outputs.length });
    } catch (error) {
      console.error('❌ Failed to enumerate devices:', error);
    }
  };

  // Switch audio input device
  const switchAudioInput = async (deviceId) => {
    if (!state) return false;
    
    try {
      const audioConstraints = optimizeAudioSettings({ deviceId: { exact: deviceId } });
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: audioConstraints,
        video: state.getVideoTracks().length > 0,
      });
      
      // Replace audio track in existing stream
      const oldAudioTrack = state.getAudioTracks()[0];
      if (oldAudioTrack) {
        state.removeTrack(oldAudioTrack);
        oldAudioTrack.stop();
      }
      
      const newAudioTrack = newStream.getAudioTracks()[0];
      if (newAudioTrack) {
        state.addTrack(newAudioTrack);
        setSelectedAudioInput(deviceId);
        setIsAudioEnabled(newAudioTrack.enabled);
      }
      
      // Clean up temporary stream
      newStream.getVideoTracks().forEach(track => track.stop());
      
      console.log('🎤 Switched to audio input:', deviceId);
      return true;
    } catch (error) {
      console.error('❌ Failed to switch audio input:', error);
      setError(error.message);
      return false;
    }
  };

  // Switch audio output device (for speakers)
  const switchAudioOutput = async (deviceId) => {
    try {
      setSelectedAudioOutput(deviceId);
      console.log('🔊 Audio output device set to:', deviceId);
      
      // Use the utility function to apply audio output device
      const results = await applyAudioOutputDevice(deviceId);
      
      // Also apply to ReactPlayer elements
      const reactPlayers = document.querySelectorAll('[data-react-player]');
      for (const player of reactPlayers) {
        const videoElement = player.querySelector('video');
        if (videoElement && videoElement.setSinkId) {
          try {
            await videoElement.setSinkId(deviceId);
            console.log('✅ Set sink ID for ReactPlayer video element');
          } catch (err) {
            console.warn('⚠️ Failed to set sink ID for ReactPlayer:', err);
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('❌ Failed to switch audio output:', error);
      return false;
    }
  };

  // Update devices on mount and when devices change
  useEffect(() => {
    updateAudioDevices();
    
    // Listen for device changes
    const handleDeviceChange = () => {
      console.log('📱 Audio devices changed');
      updateAudioDevices();
    };
    
    if (navigator.mediaDevices) {
      navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
      return () => {
        navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
      };
    }
  }, []);

  useEffect(() => {
    if (isStreamSet.current) return;
    isStreamSet.current = true;
    (async function initStream() {
      try {
        // Run audio diagnostics in development
        if (process.env.NODE_ENV === 'development') {
          console.log("🔍 Running audio diagnostics...");
          await quickAudioCheck();
        }

        // Check permissions first
        const permissionStatus = await navigator.permissions.query({
          name: "camera",
        });
        console.log("Camera permission:", permissionStatus.state);

        // Use optimized audio settings
        const audioConstraints = optimizeAudioSettings();
        
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: audioConstraints,
          video: true,
        });

        console.log("Setting your stream");
        console.log("Audio tracks:", stream.getAudioTracks().length);
        console.log("Video tracks:", stream.getVideoTracks().length);

        setState(stream);
        setPermissions({ audio: true, video: true });

        // Set initial states based on track enabled status
        const audioTracks = stream.getAudioTracks();
        const videoTracks = stream.getVideoTracks();

        if (audioTracks.length > 0) {
          setIsAudioEnabled(audioTracks[0].enabled);
        }
        if (videoTracks.length > 0) {
          setIsVideoEnabled(videoTracks[0].enabled);
        }
      } catch (e) {
        console.error("Error in media navigator:", e);
        setError(e.message);

        // Try to get audio only if video fails
        if (e.name === "NotFoundError" || e.name === "DevicesNotFoundError") {
          try {
            const audioConstraints = optimizeAudioSettings();
            const audioOnlyStream = await navigator.mediaDevices.getUserMedia({
              audio: audioConstraints,
              video: false,
            });
            setState(audioOnlyStream);
            setPermissions({ audio: true, video: false });
            console.log("Audio-only stream set");
          } catch (audioError) {
            console.error("Audio-only stream failed:", audioError);
            setError(audioError.message);
          }
        }
      }
    })();
  }, []);

  const toggleAudio = () => {
    if (state) {
      const audioTracks = state.getAudioTracks();
      if (audioTracks.length > 0) {
        const currentState = audioTracks[0].enabled;
        const newState = !currentState;
        audioTracks[0].enabled = newState;
        setIsAudioEnabled(newState);
        return newState;
      } else {
        console.warn("No audio tracks available");
      }
    } else {
      console.warn("No media stream available");
    }
    return false;
  };

  const toggleVideo = () => {
    if (state) {
      const videoTracks = state.getVideoTracks();
      if (videoTracks.length > 0) {
        const newState = !videoTracks[0].enabled;
        videoTracks[0].enabled = newState;
        setIsVideoEnabled(newState);
        console.log("Video toggled:", newState ? "ON" : "OFF");
        return newState;
      } else {
        console.warn("No video tracks available");
      }
    } else {
      console.warn("No media stream available");
    }
    return false;
  };

  return {
    stream: state,
    isAudioEnabled,
    isVideoEnabled,
    toggleAudio,
    toggleVideo,
    error,
    permissions,
    audioDevices,
    selectedAudioInput,
    selectedAudioOutput,
    switchAudioInput,
    switchAudioOutput,
    updateAudioDevices,
  };
};

export default useMediaStream;