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
      className={`relative h-screen w-full overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 ${className}`}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>
      {/* Top Bar */}
      <div className="top-0 left-0 right-0 z-40 relative">
        <div className="flex items-center justify-between p-4">
          {/* Room Info */}
          <div className="flex items-center space-x-3">
            <div className="px-3 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-white font-medium text-sm">
                  Room: {roomId?.slice(0, 8)}...
                </span>
                <div className="flex items-center space-x-1 text-gray-200">
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
              className="p-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl text-gray-200 hover:text-white hover:bg-white/20 transition-all duration-200 shadow-lg"
              title="Share room link"
            >
              <Share2 size={16} />
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl text-gray-200 hover:text-white hover:bg-white/20 transition-all duration-200 shadow-lg"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative h-full pt-16 pb-24 z-10">
        <div className="h-full">{children}</div>
      </div>
    </div>
  );
};

export default SimpleCallLayout;
