import ReactPlayer from "react-player";
import { Mic, MicOff, UserSquare2, Pin, Volume2, VolumeX } from "lucide-react";
import { useState } from "react";

const VideoGrid = ({
  players,
  highlightedPlayerId,
  onPlayerClick,
  myId,
  className = "",
}) => {
  const [pinnedPlayer, setPinnedPlayer] = useState(null);

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
    if (count <= 6) return "grid-cols-3";
    return "grid-cols-4";
  };

  const handlePinPlayer = (playerId) => {
    setPinnedPlayer(pinnedPlayer === playerId ? null : playerId);
  };

  const PlayerCard = ({
    playerId,
    player,
    isHighlighted = false,
    showControls = false,
  }) => {
    const [isHovered, setIsHovered] = useState(false);
    const isMe = playerId === myId;
    const isPinned = pinnedPlayer === playerId;

    return (
      <div
        className={`relative group cursor-pointer transition-all duration-300 ${
          isHighlighted ? "col-span-full row-span-2" : ""
        }`}
        onClick={() => onPlayerClick?.(playerId)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Video Container */}
        <div
          className={`relative overflow-hidden transition-all duration-300 ${
            isHighlighted
              ? "rounded-3xl border-4 border-blue-500/50 shadow-2xl"
              : "rounded-2xl border-2 border-white/10 hover:border-white/20"
          } ${
            !player.playing
              ? "bg-gradient-to-br from-gray-800 to-gray-900"
              : "bg-black"
          }`}
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
            <div className="w-full h-full flex items-center justify-center">
              <UserSquare2
                size={isHighlighted ? 120 : 60}
                className="text-gray-400"
              />
            </div>
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

          {/* User Info Overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Mic Status */}
              <div
                className={`p-2 rounded-full backdrop-blur-sm ${
                  player.muted
                    ? "bg-red-500/20 text-red-400"
                    : "bg-green-500/20 text-green-400"
                }`}
              >
                {player.muted ? (
                  <MicOff size={isHighlighted ? 20 : 16} />
                ) : (
                  <Mic size={isHighlighted ? 20 : 16} />
                )}
              </div>

              {/* User Label */}
              <div className="px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full">
                <span className="text-white text-sm font-medium">
                  {isMe ? "You" : `User ${playerId.slice(0, 6)}`}
                </span>
              </div>
            </div>

            {/* Controls */}
            {(isHovered || showControls) && (
              <div className="flex items-center space-x-2">
                {/* Pin Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePinPlayer(playerId);
                  }}
                  className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
                    isPinned
                      ? "bg-blue-500/30 text-blue-400"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                  title={isPinned ? "Unpin" : "Pin"}
                >
                  <Pin size={16} className={isPinned ? "fill-current" : ""} />
                </button>

                {/* Volume Control */}
                {!isMe && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle volume toggle
                    }}
                    className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-200"
                    title="Toggle volume"
                  >
                    {player.muted ? (
                      <VolumeX size={16} />
                    ) : (
                      <Volume2 size={16} />
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Connection Quality Indicator */}
          <div className="absolute top-4 right-4">
            <div className="flex space-x-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 h-3 rounded-full transition-all duration-300 ${
                    i < 2 ? "bg-green-400" : "bg-gray-500"
                  }`}
                  style={{
                    height: `${8 + i * 4}px`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Highlight Border Animation */}
          {isHighlighted && (
            <div className="absolute inset-0 border-4 border-blue-500/30 rounded-3xl animate-pulse" />
          )}
        </div>

        {/* Speaking Indicator */}
        {!player.muted && (
          <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-green-400 rounded-full animate-ping" />
        )}
      </div>
    );
  };

  return (
    <div className={`w-full h-full ${className}`}>
      {/* Main Video Area */}
      {highlightedPlayer && (
        <div className="mb-6">
          <PlayerCard
            playerId={highlightedPlayerId}
            player={highlightedPlayer}
            isHighlighted={true}
            showControls={true}
          />
        </div>
      )}

      {/* Participant Grid */}
      {otherPlayers.length > 0 && (
        <div className={`grid gap-4 ${getGridCols(otherPlayers.length)}`}>
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
            <UserSquare2 size={80} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              Waiting for participants
            </h3>
            <p className="text-gray-500">
              Share the room link to invite others to join
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoGrid;
