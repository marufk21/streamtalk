import { useState, useEffect } from "react";
import {
  Maximize2,
  Minimize2,
  Monitor,
  Users,
  Settings,
  Share2,
} from "lucide-react";

const ModernCallLayout = ({
  children,
  roomId,
  participants = [],
  isFullscreen = false,
  onToggleFullscreen,
  onShare,
  onSettings,
  className = "",
}) => {
  const [layoutMode, setLayoutMode] = useState("grid"); // grid, focus, presentation
  const [isMinimized, setIsMinimized] = useState(false);
  const [backgroundEffect, setBackgroundEffect] = useState("gradient");

  useEffect(() => {
    // Handle fullscreen changes
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
        onShare?.();
      }
    } else {
      onShare?.();
    }
  };

  const getBackgroundClass = () => {
    switch (backgroundEffect) {
      case "gradient":
        return "bg-gradient-to-br from-slate-900 via-gray-900 to-black";
      case "particles":
        return "bg-black";
      case "blur":
        return "bg-gray-900";
      default:
        return "bg-gray-900";
    }
  };

  return (
    <div
      className={`relative h-screen w-full overflow-hidden ${getBackgroundClass()} ${className}`}
    >
      {/* Animated Background */}
      {backgroundEffect === "particles" && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white opacity-10 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-40">
        <div className="flex items-center justify-between p-4">
          {/* Room Info */}
          <div className="flex items-center space-x-4">
            <div className="px-4 py-2 bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
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

          {/* Top Controls */}
          <div className="flex items-center space-x-2">
            {/* Layout Toggle */}
            <div className="flex bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
              {["grid", "focus"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setLayoutMode(mode)}
                  className={`px-3 py-2 text-xs font-medium transition-all duration-200 ${
                    layoutMode === mode
                      ? "bg-white/20 text-white"
                      : "text-gray-300 hover:bg-white/10"
                  }`}
                  title={`${mode} layout`}
                >
                  {mode === "grid" ? "Grid" : "Focus"}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleShare}
                className="p-2 bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                title="Share room"
              >
                <Share2 size={16} />
              </button>

              <button
                onClick={onSettings}
                className="p-2 bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                title="Settings"
              >
                <Settings size={16} />
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-2 bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 size={16} />
                ) : (
                  <Maximize2 size={16} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        className={`relative h-full transition-all duration-500 ${
          layoutMode === "focus" ? "pt-20 pb-32" : "pt-20 pb-20"
        }`}
      >
        <div
          className={`h-full ${
            isMinimized ? "scale-95 opacity-50" : "scale-100 opacity-100"
          } transition-all duration-300`}
        >
          {children}
        </div>
      </div>

      {/* Picture-in-Picture Mode Toggle */}
      {!isFullscreen && (
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="fixed top-6 right-6 z-30 p-2 bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
          title={isMinimized ? "Expand" : "Minimize"}
        >
          <Monitor size={16} />
        </button>
      )}

      {/* Background Effects Control */}
      <div className="fixed bottom-6 left-6 z-30">
        <div className="flex items-center space-x-2 p-2 bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl">
          <span className="text-xs text-gray-300 mr-2">BG:</span>
          {["gradient", "particles", "blur"].map((effect) => (
            <button
              key={effect}
              onClick={() => setBackgroundEffect(effect)}
              className={`w-6 h-6 rounded-lg transition-all duration-200 ${
                backgroundEffect === effect
                  ? "bg-white/20 border border-white/30"
                  : "bg-white/5 hover:bg-white/10"
              }`}
              title={`${effect} background`}
            >
              <div
                className={`w-full h-full rounded-lg ${
                  effect === "gradient"
                    ? "bg-gradient-to-br from-blue-500 to-purple-500"
                    : effect === "particles"
                    ? "bg-black border border-white/20"
                    : "bg-gray-500"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Ambient Lighting Effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Corner Glows */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl" />
      </div>

      {/* Responsive Overlay for Mobile */}
      {window.innerWidth < 768 && (
        <div className="fixed inset-0 z-20 bg-black/10 backdrop-blur-sm pointer-events-none" />
      )}

      {/* Screen Reader Support */}
      <div className="sr-only">
        <h1>Video Call Interface</h1>
        <p>
          Room {roomId} with {participants.length} participants
        </p>
        <p>Current layout: {layoutMode}</p>
      </div>
    </div>
  );
};

export default ModernCallLayout;
