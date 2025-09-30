import { useState, useEffect } from "react";
import {
  Wifi,
  WifiOff,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
  Users,
  Clock,
  Volume2,
  Mic,
} from "lucide-react";

const CallStatus = ({
  isConnected = false,
  connectionQuality = "good",
  participantCount = 0,
  callDuration = 0,
  networkStats = {},
  className = "",
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const getSignalIcon = (quality) => {
    switch (quality) {
      case "excellent":
        return <Signal size={16} className="text-green-400" />;
      case "good":
        return <SignalHigh size={16} className="text-green-400" />;
      case "fair":
        return <SignalMedium size={16} className="text-yellow-400" />;
      case "poor":
        return <SignalLow size={16} className="text-red-400" />;
      default:
        return <WifiOff size={16} className="text-gray-400" />;
    }
  };

  const getConnectionColor = (quality) => {
    switch (quality) {
      case "excellent":
      case "good":
        return "border-green-500/30 bg-green-500/10";
      case "fair":
        return "border-yellow-500/30 bg-yellow-500/10";
      case "poor":
        return "border-red-500/30 bg-red-500/10";
      default:
        return "border-gray-500/30 bg-gray-500/10";
    }
  };

  const formatBitrate = (bitrate) => {
    if (!bitrate) return "N/A";
    if (bitrate < 1000) return `${bitrate} bps`;
    if (bitrate < 1000000) return `${(bitrate / 1000).toFixed(1)} kbps`;
    return `${(bitrate / 1000000).toFixed(1)} Mbps`;
  };

  return (
    <div className={`fixed top-6 left-6 z-50 ${className}`}>
      {/* Main Status Bar */}
      <div
        className={`flex items-center space-x-3 px-4 py-3 bg-black/20 backdrop-blur-xl border rounded-2xl shadow-2xl cursor-pointer transition-all duration-300 ${getConnectionColor(
          connectionQuality
        )}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Connection Status */}
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <div className="flex items-center space-x-1">
              <Wifi size={16} className="text-green-400" />
              {getSignalIcon(connectionQuality)}
            </div>
          ) : (
            <WifiOff size={16} className="text-red-400" />
          )}
          <span
            className={`text-sm font-medium ${
              isConnected ? "text-green-400" : "text-red-400"
            }`}
          >
            {isConnected
              ? connectionQuality.charAt(0).toUpperCase() +
                connectionQuality.slice(1)
              : "Disconnected"}
          </span>
        </div>

        {/* Participants */}
        <div className="flex items-center space-x-1 text-gray-300">
          <Users size={16} />
          <span className="text-sm">{participantCount}</span>
        </div>

        {/* Call Duration */}
        <div className="flex items-center space-x-1 text-gray-300">
          <Clock size={16} />
          <span className="text-sm font-mono">
            {formatDuration(callDuration)}
          </span>
        </div>

        {/* Expand Indicator */}
        <div
          className={`w-4 h-4 border-l border-b border-gray-400 transform transition-transform duration-200 ${
            isExpanded ? "rotate-135" : "rotate-45"
          }`}
        />
      </div>

      {/* Expanded Stats Panel */}
      {isExpanded && (
        <div className="mt-3 p-4 bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl min-w-[300px]">
          <h3 className="text-white font-semibold mb-3 text-sm">
            Call Statistics
          </h3>

          <div className="grid grid-cols-2 gap-4 text-sm">
            {/* Network Stats */}
            <div className="space-y-2">
              <h4 className="text-gray-300 font-medium">Network</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Upload:</span>
                  <span className="text-white">
                    {formatBitrate(networkStats.upload)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Download:</span>
                  <span className="text-white">
                    {formatBitrate(networkStats.download)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Latency:</span>
                  <span className="text-white">
                    {networkStats.latency || "N/A"} ms
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Packet Loss:</span>
                  <span
                    className={`${
                      (networkStats.packetLoss || 0) > 5
                        ? "text-red-400"
                        : "text-green-400"
                    }`}
                  >
                    {networkStats.packetLoss || 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Media Stats */}
            <div className="space-y-2">
              <h4 className="text-gray-300 font-medium">Media</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Video:</span>
                  <span className="text-white">
                    {networkStats.videoResolution || "720p"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">FPS:</span>
                  <span className="text-white">{networkStats.fps || 30}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Audio:</span>
                  <span className="text-white">
                    {networkStats.audioCodec || "Opus"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Jitter:</span>
                  <span className="text-white">
                    {networkStats.jitter || "N/A"} ms
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Indicators */}
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <Volume2 size={12} className="text-blue-400" />
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 h-4 rounded-full transition-all duration-150 ${
                          i < 3 ? "bg-blue-400" : "bg-gray-600"
                        }`}
                        style={{
                          height: `${8 + Math.random() * 8}px`,
                        }}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-gray-400">Audio Level</span>
              </div>

              <div className="flex items-center space-x-1 text-gray-400">
                <span>Updated:</span>
                <span className="text-white">
                  {currentTime.toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>

          {/* Quality Indicator Bars */}
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Connection Quality</span>
              <span
                className={`font-medium ${
                  connectionQuality === "excellent" ||
                  connectionQuality === "good"
                    ? "text-green-400"
                    : connectionQuality === "fair"
                    ? "text-yellow-400"
                    : "text-red-400"
                }`}
              >
                {connectionQuality}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  connectionQuality === "excellent"
                    ? "bg-green-400 w-full"
                    : connectionQuality === "good"
                    ? "bg-green-400 w-4/5"
                    : connectionQuality === "fair"
                    ? "bg-yellow-400 w-3/5"
                    : "bg-red-400 w-2/5"
                }`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallStatus;
