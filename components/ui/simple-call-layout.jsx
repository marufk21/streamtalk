import { useState, useEffect } from "react";
import { Maximize2, Minimize2, Users, Share2 } from "lucide-react";

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
        // Fallback to copy to clipboard
        if (navigator.clipboard) {
          navigator.clipboard.writeText(window.location.href);
          alert("Room link copied to clipboard!");
        }
      }
    } else {
      // Fallback for browsers without Web Share API
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
        alert("Room link copied to clipboard!");
      } else {
        // Final fallback
        onShare?.();
      }
    }
  };

  return (
    <div
      className={`relative h-screen w-full overflow-hidden bg-gray-900 ${className}`}
    >
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-40">
        <div className="flex items-center justify-between p-4">
          {/* Room Info */}
          <div className="flex items-center space-x-3">
            <div className="px-3 py-2 bg-gray-800/90 backdrop-blur-sm border border-gray-600/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-white font-medium text-sm">
                  Room: {roomId?.slice(0, 8)}...
                </span>
                <div className="flex items-center space-x-1 text-gray-300">
                  <Users size={14} />
                  <span className="text-xs">{participants.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Share Button and Fullscreen Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleShare}
              className="p-2 bg-gray-800/90 backdrop-blur-sm border border-gray-600/50 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700/90 transition-colors duration-200"
              title="Share room link"
            >
              <Share2 size={16} />
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 bg-gray-800/90 backdrop-blur-sm border border-gray-600/50 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700/90 transition-colors duration-200"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative h-full pt-16 pb-20">
        <div className="h-full">{children}</div>
      </div>
    </div>
  );
};

export default SimpleCallLayout;
