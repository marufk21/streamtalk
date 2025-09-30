import { Mic, Video, PhoneOff, MicOff, VideoOff } from "lucide-react";

const FloatingControls = ({
  muted,
  playing,
  toggleAudio,
  toggleVideo,
  leaveRoom,
}) => {
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      {/* Main Control Bar */}
      <div className="flex items-center space-x-3 px-4 py-3 bg-gray-800/90 backdrop-blur-sm border border-gray-600/30 rounded-lg shadow-lg">
        {/* Audio Control */}
        <button
          onClick={toggleAudio}
          className={`p-3 rounded-md transition-colors duration-200 ${
            muted
              ? "bg-red-500/80 hover:bg-red-500 text-white"
              : "bg-gray-600/50 hover:bg-gray-500/70 text-gray-200"
          }`}
          title={muted ? "Unmute microphone" : "Mute microphone"}
        >
          {muted ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        {/* Video Control */}
        <button
          onClick={toggleVideo}
          className={`p-3 rounded-md transition-colors duration-200 ${
            !playing
              ? "bg-red-500/80 hover:bg-red-500 text-white"
              : "bg-gray-600/50 hover:bg-gray-500/70 text-gray-200"
          }`}
          title={!playing ? "Turn on camera" : "Turn off camera"}
        >
          {!playing ? <VideoOff size={18} /> : <Video size={18} />}
        </button>

        {/* Leave Call */}
        <button
          onClick={leaveRoom}
          className="p-3 rounded-md transition-colors duration-200 bg-red-600/80 hover:bg-red-600 text-white"
          title="Leave call"
        >
          <PhoneOff size={18} />
        </button>
      </div>
    </div>
  );
};

export default FloatingControls;
