import { Mic, Video, PhoneOff, MicOff, VideoOff } from "lucide-react";

const Bottom = (props) => {
  const { muted, playing, toggleAudio, toggleVideo, leaveRoom } = props;

  return (
    <div className="flex justify-center items-center space-x-2 p-4 bg-gray-800 rounded-t-lg">
      {muted ? (
        <MicOff
          className="text-red-500 cursor-pointer hover:text-red-400 transition-all"
          size={55}
          onClick={toggleAudio}
        />
      ) : (
        <Mic
          className="text-green-500 cursor-pointer hover:text-green-400 transition-all"
          size={55}
          onClick={toggleAudio}
        />
      )}
      {playing ? (
        <Video
          className="text-blue-500 cursor-pointer hover:text-blue-400 transition-all"
          size={55}
          onClick={toggleVideo}
        />
      ) : (
        <VideoOff
          className="text-gray-500 cursor-pointer hover:text-gray-400 transition-all"
          size={55}
          onClick={toggleVideo}
        />
      )}
      <PhoneOff
        size={55}
        className="text-red-500 cursor-pointer hover:text-red-400 transition-all"
        onClick={leaveRoom}
      />
    </div>
  );
};

export default Bottom;
