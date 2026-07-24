import ReactPlayer from "react-player";
import { Mic, MicOff, Users } from "lucide-react";
import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// --- Pure helpers (outside component so they're stable references) ---

const getGridCols = (count) => {
  if (count === 1) return "grid-cols-1";
  if (count === 2) return "grid-cols-1 sm:grid-cols-2";
  if (count <= 4) return "grid-cols-1 sm:grid-cols-2";
  return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";
};

const getVideoSize = (count, isHighlighted = false) => {
  if (isHighlighted) {
    return { minHeight: "clamp(180px, 35vh, 400px)", maxHeight: "60vh" };
  }
  if (count === 1) return { minHeight: "clamp(160px, 28vh, 300px)", maxHeight: "50vh" };
  if (count === 2) return { minHeight: "clamp(130px, 22vh, 250px)", maxHeight: "40vh" };
  if (count <= 4) return { minHeight: "clamp(110px, 18vh, 200px)", maxHeight: "30vh" };
  return { minHeight: "clamp(90px, 15vh, 150px)", maxHeight: "25vh" };
};

// --- PlayerCard (defined at module level — React 19 static-components rule) ---

const PlayerCard = memo(
  ({
    playerId,
    player,
    isHighlighted = false,
    totalCount = 1,
    isAudioEnabled,
    myId,
    onPlayerClick,
    selectedAudioOutput,
  }) => {
    const isMe = playerId === myId;
    const videoSize = getVideoSize(totalCount, isHighlighted);
    const playerMuted = isMe
      ? !isAudioEnabled
      : !(player.audioEnabled ?? !player.muted);

    return (
      <div
        className={`relative cursor-pointer transition-all duration-200 ${
          isHighlighted ? "col-span-full" : ""
        }`}
        onClick={() => onPlayerClick?.(playerId)}
      >
        {/* Video Container */}
        <div
          className={`relative overflow-hidden rounded-lg transition-all duration-200 aspect-video [&_video]:object-cover ${
            isHighlighted
              ? "ring-2 ring-border bg-black"
              : "border border-border bg-black hover:border-border/70"
          }`}
          style={{
            height: videoSize.minHeight,
          }}
        >
          {player.playing ? (
            <div
              style={{
                transform: "scaleX(-1)",
                width: "100%",
                height: "100%",
              }}
            >
              <ReactPlayer
                url={player.url}
                muted={player.muted}
                playing={player.playing}
                width="100%"
                height="100%"
                className="object-cover"
                onReady={(player) => {
                  if (
                    selectedAudioOutput &&
                    selectedAudioOutput !== "default"
                  ) {
                    const videoElement = player.getInternalPlayer();
                    if (videoElement && videoElement.setSinkId) {
                      videoElement
                        .setSinkId(selectedAudioOutput)
                        .catch((err) => {
                          console.warn(
                            "Failed to set audio output device:",
                            err
                          );
                        });
                    }
                  }
                }}
              />
            </div>
          ) : (
            <div
              className="flex items-center justify-center bg-card"
              style={{
                width: "100%",
                height: "100%",
              }}
            >
              <Avatar className="w-10 h-10 sm:w-14 sm:h-16">
                <AvatarFallback className="text-muted-foreground text-sm sm:text-lg">
                  {(playerId?.slice(0, 2) || "U").toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          )}

          {/* User Info Overlay */}
          <div className="absolute bottom-1.5 sm:bottom-2 left-1.5 sm:left-2 flex items-center gap-1 sm:gap-1.5">
            <Badge
              variant={playerMuted ? "destructive" : "secondary"}
              className="px-1 h-4 sm:h-5"
            >
              {playerMuted ? (
                <MicOff size={9} />
              ) : (
                <Mic size={9} />
              )}
            </Badge>
            <Badge variant="secondary" className="text-[9px] sm:text-[10px] font-medium px-1.5 h-4 sm:h-5">
              {isMe ? "You" : `User ${playerId.slice(0, 4)}`}
            </Badge>
          </div>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.playerId === nextProps.playerId &&
      prevProps.player.url === nextProps.player.url &&
      prevProps.player.muted === nextProps.player.muted &&
      prevProps.player.playing === nextProps.player.playing &&
      prevProps.isHighlighted === nextProps.isHighlighted &&
      prevProps.totalCount === nextProps.totalCount &&
      prevProps.isAudioEnabled === nextProps.isAudioEnabled &&
      prevProps.myId === nextProps.myId &&
      prevProps.selectedAudioOutput === nextProps.selectedAudioOutput
    );
  }
);

PlayerCard.displayName = "PlayerCard";

// --- SimpleVideoGrid ---

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

  return (
    <div
      className={`w-full h-full flex flex-col justify-center items-center ${className}`}
    >
      {/* Main Video Area */}
      {highlightedPlayer && (
        <div className="mb-2 sm:mb-3 md:mb-4 flex justify-center items-center w-full">
          <div className="w-full max-w-2xl sm:max-w-3xl md:max-w-4xl mx-auto">
            <PlayerCard
              key={`${highlightedPlayerId}-${highlightedPlayer.url}`}
              playerId={highlightedPlayerId}
              player={highlightedPlayer}
              isHighlighted={true}
              totalCount={playerEntries.length}
              isAudioEnabled={isAudioEnabled}
              myId={myId}
              onPlayerClick={onPlayerClick}
              selectedAudioOutput={selectedAudioOutput}
            />
          </div>
        </div>
      )}

      {/* Participant Grid */}
      {otherPlayers.length > 0 && (
        <div className="flex justify-center items-center w-full">
          <div
            className={`grid gap-1.5 sm:gap-2 md:gap-3 ${getGridCols(otherPlayers.length)} w-full max-w-full sm:max-w-3xl md:max-w-6xl justify-items-center`}
          >
            {otherPlayers.map(([playerId, player]) => (
              <PlayerCard
                key={`${playerId}-${player.url}`}
                playerId={playerId}
                player={player}
                isHighlighted={false}
                totalCount={playerEntries.length}
                isAudioEnabled={isAudioEnabled}
                myId={myId}
                onPlayerClick={onPlayerClick}
                selectedAudioOutput={selectedAudioOutput}
                />
            ))}
          </div>
        </div>
      )}

      {/* Single player view */}
      {!highlightedPlayer &&
        otherPlayers.length === 0 &&
        playerEntries.length === 1 && (
          <div className="flex justify-center items-center w-full px-1 sm:px-0">
            <div className="w-full max-w-md sm:max-w-2xl md:max-w-3xl mx-auto">
              <PlayerCard
                key={`${playerEntries[0][0]}-${playerEntries[0][1].url}`}
                playerId={playerEntries[0][0]}
                player={playerEntries[0][1]}
                isHighlighted={false}
                totalCount={1}
                isAudioEnabled={isAudioEnabled}
                myId={myId}
                onPlayerClick={onPlayerClick}
                selectedAudioOutput={selectedAudioOutput}
                />
            </div>
          </div>
        )}

      {/* Empty State */}
      {playerEntries.length === 0 && (
        <div className="w-full h-full flex items-center justify-center animate-fade-in">
          <div className="text-center space-y-2 sm:space-y-3 px-4">
            <Avatar className="w-12 h-12 sm:w-16 sm:h-16 mx-auto">
              <AvatarFallback>
                <Users size={18} className="text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <h3 className="text-sm sm:text-base font-medium text-foreground">
              Waiting for participants
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-[240px] sm:max-w-xs">
              Share the room link to invite others to join the call
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(SimpleVideoGrid, (prevProps, nextProps) => {
  const prevPlayerIds = Object.keys(prevProps.players || {}).sort();
  const nextPlayerIds = Object.keys(nextProps.players || {}).sort();

  return (
    prevPlayerIds.length === nextPlayerIds.length &&
    prevPlayerIds.every((id, index) => id === nextPlayerIds[index]) &&
    prevProps.highlightedPlayerId === nextProps.highlightedPlayerId &&
    prevProps.myId === nextProps.myId &&
    prevProps.isAudioEnabled === nextProps.isAudioEnabled &&
    JSON.stringify(prevProps.players) === JSON.stringify(nextProps.players)
  );
});
