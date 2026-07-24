import { Mic, Video, PhoneOff, MicOff, VideoOff, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

const FloatingControls = ({
  muted,
  playing,
  toggleAudio,
  toggleVideo,
  leaveRoom,
  onTroubleshoot,
  onToggleChat,
  isChatOpen = false,
  unreadCount = 0,
}) => {
  return (
    <TooltipProvider>
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 max-w-2xl mx-auto">
          {/* Left — Media Controls */}
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={muted ? "destructive" : "secondary"}
                  size="icon"
                  onClick={toggleAudio}
                  aria-label={muted ? "Unmute microphone" : "Mute microphone"}
                >
                  {muted ? <MicOff size={16} /> : <Mic size={16} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {muted ? "Unmute" : "Mute"}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={!playing ? "destructive" : "secondary"}
                  size="icon"
                  onClick={toggleVideo}
                  aria-label={!playing ? "Turn on camera" : "Turn off camera"}
                >
                  {!playing ? <VideoOff size={18} /> : <Video size={18} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {!playing ? "Start camera" : "Stop camera"}
              </TooltipContent>
            </Tooltip>

          </div>

          {/* Center — Leave Call */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                onClick={leaveRoom}
                className="h-9 w-9 sm:h-11 sm:w-11"
                aria-label="Leave call"
              >
                <PhoneOff size={20} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Leave call</TooltipContent>
          </Tooltip>

          {/* Right — Chat Toggle */}
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isChatOpen ? "default" : "secondary"}
                  size="icon"
                  onClick={onToggleChat}
                  className="relative"
                  aria-label={isChatOpen ? "Close chat" : "Open chat"}
                >
                  <MessageCircle size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isChatOpen ? "Close chat" : "Open chat"}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default FloatingControls;
