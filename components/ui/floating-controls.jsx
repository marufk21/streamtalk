import { Mic, Video, PhoneOff, MicOff, VideoOff } from "lucide-react";

const FloatingControls = ({
  muted,
  playing,
  toggleAudio,
  toggleVideo,
  leaveRoom,
}) => {
  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      {/* Main Control Bar */}
      <div className="flex items-center space-x-3 px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl">
        {/* Audio Control */}
        <button
          onClick={toggleAudio}
          className={`p-3 rounded-2xl transition-all duration-200 shadow-lg ${
            muted
              ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white transform hover:scale-105"
              : "bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-gray-200 hover:text-white"
          }`}
          title={muted ? "Unmute microphone" : "Mute microphone"}
        >
          {muted ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        {/* Video Control */}
        <button
          onClick={toggleVideo}
          className={`p-3 rounded-2xl transition-all duration-200 shadow-lg ${
            !playing
              ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white transform hover:scale-105"
              : "bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-gray-200 hover:text-white"
          }`}
          title={!playing ? "Turn on camera" : "Turn off camera"}
        >
          {!playing ? <VideoOff size={18} /> : <Video size={18} />}
        </button>

        {/* Leave Call */}
        <button
          onClick={leaveRoom}
          className="p-3 rounded-2xl transition-all duration-200 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white shadow-lg transform hover:scale-105"
          title="Leave call"
        >
          <PhoneOff size={18} />
        </button>
      </div>
    </div>
  );
};

export default FloatingControls;
