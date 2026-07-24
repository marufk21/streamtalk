import { useState, useEffect } from "react";
import { Maximize2, Minimize2, Users, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

const SimpleCallLayout = ({
  children,
  roomId,
  participants = [],
  isFullscreen = false,
  onToggleFullscreen,
  onShare,
  className = "",
}) => {
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = document.fullscreenElement !== null;
      if (isCurrentlyFullscreen !== isFullscreen && onToggleFullscreen) {
        onToggleFullscreen(isCurrentlyFullscreen);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [isFullscreen, onToggleFullscreen]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join my video call",
          text: "Join me for a video call on StreamTalk",
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
        if (navigator.clipboard) {
          navigator.clipboard.writeText(window.location.href);
          alert("Room link copied to clipboard!");
        }
      }
    } else {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
        alert("Room link copied to clipboard!");
      } else {
        onShare?.();
      }
    }
  };

  return (
    <TooltipProvider>
      <div
        className={`relative h-screen w-full overflow-hidden bg-background flex flex-col ${className}`}
      >
        {/* Top Bar */}
        <header className="shrink-0 border-b bg-background/80 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 h-14">
            {/* Room Info */}
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="gap-1.5 pl-2 pr-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-xs font-medium">
                  {roomId?.slice(0, 8)}&hellip;
                </span>
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Users size={12} />
                <span className="text-xs">{participants.length}</span>
              </Badge>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleShare}
                    aria-label="Share room link"
                  >
                    <Share2 size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Share room link</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleFullscreen}
                    aria-label={
                      isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
                    }
                  >
                    {isFullscreen ? (
                      <Minimize2 size={16} />
                    ) : (
                      <Maximize2 size={16} />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </TooltipProvider>
  );
};

export default SimpleCallLayout;
