import ReactPlayer from "react-player";
import { Mic, MicOff, UserSquare2 } from "lucide-react";

const SimpleVideoGrid = ({
  players,
  highlightedPlayerId,
  onPlayerClick,
  myId,
  className = "",
}) => {
  const playerEntries = Object.entries(players || {});
  const highlightedPlayer = highlightedPlayerId
    ? players[highlightedPlayerId]
    : null;
  const otherPlayers = playerEntries.filter(
    ([id]) => id !== highlightedPlayerId
  );

  const getGridCols = (count) => {
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    if (count === 3) return "grid-cols-3";
    if (count <= 4) return "grid-cols-2";
    return "grid-cols-3";
  };

  const PlayerCard = ({ playerId, player, isHighlighted = false }) => {
    const isMe = playerId === myId;

    return (
      <div
        className={`relative cursor-pointer transition-all duration-200 ${
          isHighlighted ? "col-span-full" : ""
        }`}
        onClick={() => onPlayerClick?.(playerId)}
      >
        {/* Video Container */}
        <div
          className={`relative overflow-hidden transition-all duration-200 ${
            isHighlighted
              ? "rounded-lg border-2 border-blue-500 shadow-lg"
              : "rounded-lg border border-gray-600"
          } ${!player.playing ? "bg-gray-800" : "bg-black"}`}
          style={{
            aspectRatio: isHighlighted ? "16/9" : "4/3",
            minHeight: isHighlighted ? "400px" : "150px",
          }}
        >
          {player.playing ? (
            <ReactPlayer
              url={player.url}
              muted={player.muted}
              playing={player.playing}
              width="100%"
              height="100%"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <UserSquare2
                size={isHighlighted ? 80 : 40}
                className="text-gray-400"
              />
            </div>
          )}

          {/* User Info Overlay */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Mic Status */}
              <div
                className={`p-1.5 rounded-full ${
                  player.muted
                    ? "bg-red-500/80 text-white"
                    : "bg-green-500/80 text-white"
                }`}
              >
                {player.muted ? (
                  <MicOff size={isHighlighted ? 16 : 12} />
                ) : (
                  <Mic size={isHighlighted ? 16 : 12} />
                )}
              </div>

              {/* User Label */}
              <div className="px-2 py-1 bg-black/70 backdrop-blur-sm rounded text-white text-xs font-medium">
                {isMe ? "You" : `User ${playerId.slice(0, 6)}`}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`w-full h-full ${className}`}>
      {/* Main Video Area */}
      {highlightedPlayer && (
        <div className="mb-4">
          <PlayerCard
            playerId={highlightedPlayerId}
            player={highlightedPlayer}
            isHighlighted={true}
          />
        </div>
      )}

      {/* Participant Grid */}
      {otherPlayers.length > 0 && (
        <div className={`grid gap-3 ${getGridCols(otherPlayers.length)}`}>
          {otherPlayers.map(([playerId, player]) => (
            <PlayerCard
              key={playerId}
              playerId={playerId}
              player={player}
              isHighlighted={false}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {playerEntries.length === 0 && (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <UserSquare2 size={60} className="text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              Waiting for participants
            </h3>
            <p className="text-gray-500 text-sm">
              Share the room link to invite others
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleVideoGrid;
