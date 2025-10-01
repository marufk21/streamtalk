import ReactPlayer from "react-player";
import { Mic, MicOff, UserSquare2 } from "lucide-react";
import { memo } from "react";

const SimpleVideoGrid = ({
  players,
  highlightedPlayerId,
  onPlayerClick,
  myId,
  className = "",
  isAudioEnabled,
  selectedAudioOutput,
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

  // Calculate optimal video sizes based on participant count
  const getVideoSize = (count, isHighlighted = false) => {
    if (isHighlighted) {
      return {
        minHeight: "400px",
        maxHeight: "60vh",
      };
    }

    // Dynamic sizing based on participant count
    if (count === 1) {
      return {
        minHeight: "300px",
        maxHeight: "50vh",
      };
    } else if (count === 2) {
      return {
        minHeight: "250px",
        maxHeight: "40vh",
      };
    } else if (count <= 4) {
      return {
        minHeight: "200px",
        maxHeight: "30vh",
      };
    } else {
      return {
        minHeight: "150px",
        maxHeight: "25vh",
      };
    }
  };

  // Memoized PlayerCard component for stability during dynamic changes
  const PlayerCard = memo(
    ({
      playerId,
      player,
      isHighlighted = false,
      totalCount = 1,
      isAudioEnabled,
    }) => {
      const isMe = playerId === myId;
      const videoSize = getVideoSize(totalCount, isHighlighted);

      return (
        <div
          className={`relative cursor-pointer transition-all duration-300 ease-in-out ${
            isHighlighted ? "col-span-full" : ""
          }`}
          onClick={() => onPlayerClick?.(playerId)}
        >
          {/* Video Container */}
          <div
            className={`relative overflow-hidden transition-all duration-300 ease-in-out backdrop-blur-sm ${
              isHighlighted
                ? "rounded-2xl border-2 border-gradient-to-r from-red-400 via-purple-400 to-blue-400 shadow-2xl bg-white/10"
                : "rounded-2xl border border-white/20 bg-white/5 hover:border-white/30 hover:bg-white/10"
            } ${
              !player.playing
                ? "bg-gradient-to-br from-slate-800 to-purple-900"
                : "bg-black"
            }`}
            style={{
              minHeight: videoSize.minHeight,
              maxHeight: videoSize.maxHeight,
              width: "100%",
              height: "100%",
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
                onReady={(player) => {
                  // Set audio output device when player is ready
                  if (selectedAudioOutput && selectedAudioOutput !== 'default') {
                    const videoElement = player.getInternalPlayer();
                    if (videoElement && videoElement.setSinkId) {
                      videoElement.setSinkId(selectedAudioOutput).catch(err => {
                        console.warn('Failed to set audio output device:', err);
                      });
                    }
                  }
                }}
              />
            ) : (
              <div
                className="relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-slate-800 to-purple-900 backdrop-blur-sm"
                style={{
                  minHeight: videoSize.minHeight,
                  maxHeight: videoSize.maxHeight,
                  width: "100%",
                  height: "100%",
                }}
              >
                <UserSquare2
                  size={20}
                  width="180%"
                  height="100%"
                  className="object-cover text-purple-300 px-32 py-16"
                />
              </div>
            )}

            {/* User Info Overlay */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {/* Mic Status */}
                <div
                  className={`p-1.5 rounded-full backdrop-blur-sm transition-colors duration-200 ${
                    // For your own video, use actual audio state; for others, use audioEnabled or fallback to muted
                    (
                      isMe
                        ? !isAudioEnabled
                        : !(player.audioEnabled ?? !player.muted)
                    )
                      ? "bg-red-500/90 text-white shadow-lg"
                      : "bg-green-500/90 text-white shadow-lg"
                  }`}
                >
                  {(
                    isMe
                      ? !isAudioEnabled
                      : !(player.audioEnabled ?? !player.muted)
                  ) ? (
                    <MicOff size={isHighlighted ? 16 : 12} />
                  ) : (
                    <Mic size={isHighlighted ? 16 : 12} />
                  )}
                </div>

                {/* User Label */}
                <div className="px-2 py-1 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white text-xs font-medium shadow-lg">
                  {isMe ? "You" : `User ${playerId.slice(0, 6)}`}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    },
    (prevProps, nextProps) => {
      // Custom comparison for memoization stability
      return (
        prevProps.playerId === nextProps.playerId &&
        prevProps.player.url === nextProps.player.url &&
        prevProps.player.muted === nextProps.player.muted &&
        prevProps.player.playing === nextProps.player.playing &&
        prevProps.isHighlighted === nextProps.isHighlighted &&
        prevProps.totalCount === nextProps.totalCount &&
        prevProps.isAudioEnabled === nextProps.isAudioEnabled // Add isAudioEnabled to comparison
      );
    }
  );

  PlayerCard.displayName = "PlayerCard";

  return (
    <div
      className={`w-full h-full flex flex-col justify-center items-center ${className}`}
    >
      {/* Main Video Area */}
      {highlightedPlayer && (
        <div className="mb-6 flex justify-center items-center w-full">
          <div className="w-full max-w-4xl mx-auto">
            <PlayerCard
              key={`${highlightedPlayerId}-${highlightedPlayer.url}`}
              playerId={highlightedPlayerId}
              player={highlightedPlayer}
              isHighlighted={true}
              totalCount={playerEntries.length}
              isAudioEnabled={isAudioEnabled} // Pass the prop
            />
          </div>
        </div>
      )}

      {/* Participant Grid */}
      {otherPlayers.length > 0 && (
        <div className="flex justify-center items-center w-full">
          <div
            className={`grid gap-4 ${getGridCols(
              otherPlayers.length
            )} w-full max-w-6xl justify-items-center`}
          >
            {otherPlayers.map(([playerId, player]) => (
              <PlayerCard
                key={`${playerId}-${player.url}`}
                playerId={playerId}
                player={player}
                isHighlighted={false}
                totalCount={playerEntries.length}
                isAudioEnabled={isAudioEnabled} // Pass the prop
              />
            ))}
          </div>
        </div>
      )}

      {/* Single player view (when no highlighted player) */}
      {!highlightedPlayer &&
        otherPlayers.length === 0 &&
        playerEntries.length === 1 && (
          <div className="flex justify-center items-center w-full">
            <div className="w-full max-w-3xl mx-auto">
              <PlayerCard
                key={`${playerEntries[0][0]}-${playerEntries[0][1].url}`}
                playerId={playerEntries[0][0]}
                player={playerEntries[0][1]}
                isHighlighted={false}
                totalCount={1}
                isAudioEnabled={isAudioEnabled} // Pass the prop
              />
            </div>
          </div>
        )}

      {/* Empty State */}
      {playerEntries.length === 0 && (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <UserSquare2 size={60} className="text-purple-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-white mb-2">
              Waiting for participants
            </h3>
            <p className="text-gray-300 text-sm">
              Share the room link to invite others
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(SimpleVideoGrid, (prevProps, nextProps) => {
  // Memoization for rendering stability during dynamic participant changes
  const prevPlayerIds = Object.keys(prevProps.players || {}).sort();
  const nextPlayerIds = Object.keys(nextProps.players || {}).sort();

  return (
    prevPlayerIds.length === nextPlayerIds.length &&
    prevPlayerIds.every((id, index) => id === nextPlayerIds[index]) &&
    prevProps.highlightedPlayerId === nextProps.highlightedPlayerId &&
    prevProps.myId === nextProps.myId &&
    prevProps.isAudioEnabled === nextProps.isAudioEnabled && // Add this
    JSON.stringify(prevProps.players) === JSON.stringify(nextProps.players)
  );
});