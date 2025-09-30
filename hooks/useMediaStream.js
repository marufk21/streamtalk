import { useState, useEffect, useRef } from "react";

const useMediaStream = () => {
  const [state, setState] = useState(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [error, setError] = useState(null);
  const [permissions, setPermissions] = useState({
    audio: false,
    video: false,
  });
  const isStreamSet = useRef(false);

  useEffect(() => {
    if (isStreamSet.current) return;
    isStreamSet.current = true;
    (async function initStream() {
      try {
        // Check permissions first
        const permissionStatus = await navigator.permissions.query({
          name: "camera",
        });
        console.log("Camera permission:", permissionStatus.state);

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
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
            const audioOnlyStream = await navigator.mediaDevices.getUserMedia({
              audio: true,
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
        const newState = !audioTracks[0].enabled;
        audioTracks[0].enabled = newState;
        setIsAudioEnabled(newState);
        console.log("Audio toggled:", newState ? "ON" : "OFF");
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
  };
};

export default useMediaStream;
