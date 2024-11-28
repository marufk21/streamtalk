import ReactPlayer from "react-player";
import { Mic, MicOff, UserSquare2 } from "lucide-react";

const Player = (props) => {
  const { url, muted, playing, isActive } = props;
  
  return (
    <div
      className={`${
        isActive ? "border-4 border-blue-500" : "border-2 border-gray-500"
      } ${
        !playing ? "bg-gray-300" : ""
      } p-2 rounded-lg relative overflow-hidden`}
    >
      {playing ? (
        <ReactPlayer
          url={url}
          muted={muted}
          playing={playing}
          width="100%"
          height="100%"
        />
      ) : (
        <UserSquare2 className={`${isActive ? "w-96 h-96" : "w-40 h-40"}`} />
      )}

      {!isActive && (
        muted ? (
          <MicOff className="absolute bottom-2 left-2 text-gray-500" size={20} />
        ) : (
          <Mic className="absolute bottom-2 left-2 text-green-500" size={20} />
        )
      )}
    </div>
  );
};

export default Player;
