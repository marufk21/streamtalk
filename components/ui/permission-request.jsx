import { useState } from "react";
import { Camera, Mic, RefreshCw, AlertTriangle, Settings } from "lucide-react";

const PermissionRequest = ({ error, permissions, onRetry, className = "" }) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    await onRetry?.();
    setTimeout(() => setIsRetrying(false), 2000);
  };

  const getErrorMessage = (error) => {
    if (!error) return null;

    if (
      error.includes("Permission denied") ||
      error.includes("NotAllowedError")
    ) {
      return {
        title: "Camera & Microphone Access Required",
        message:
          "Please allow access to your camera and microphone to join the video call.",
        type: "permission",
      };
    }

    if (
      error.includes("NotFoundError") ||
      error.includes("DevicesNotFoundError")
    ) {
      return {
        title: "No Camera or Microphone Found",
        message: "Please check that your devices are connected and try again.",
        type: "device",
      };
    }

    return {
      title: "Media Access Error",
      message: error,
      type: "general",
    };
  };

  const errorInfo = getErrorMessage(error);

  if (!error && permissions.audio && permissions.video) {
    return null; // No errors, all permissions granted
  }

  return (
    <div
      className={`fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 ${className}`}
    >
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-md mx-4 text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          {errorInfo?.type === "permission" ? (
            <div className="flex space-x-2">
              <Camera size={24} className="text-red-400" />
              <Mic size={24} className="text-red-400" />
            </div>
          ) : errorInfo?.type === "device" ? (
            <AlertTriangle size={32} className="text-yellow-400" />
          ) : (
            <AlertTriangle size={32} className="text-red-400" />
          )}
        </div>

        {/* Title */}
        <h2 className="text-white text-xl font-semibold mb-3">
          {errorInfo?.title || "Media Access Required"}
        </h2>

        {/* Message */}
        <p className="text-gray-300 text-sm leading-relaxed mb-6">
          {errorInfo?.message ||
            "Please allow access to your camera and microphone to join the video call."}
        </p>

        {/* Permission Status */}
        <div className="flex justify-center space-x-4 mb-6">
          <div
            className={`flex items-center space-x-2 px-3 py-2 rounded-xl ${
              permissions.audio
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            <Mic size={16} />
            <span className="text-xs font-medium">
              {permissions.audio ? "Allowed" : "Denied"}
            </span>
          </div>

          <div
            className={`flex items-center space-x-2 px-3 py-2 rounded-xl ${
              permissions.video
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            <Camera size={16} />
            <span className="text-xs font-medium">
              {permissions.video ? "Allowed" : "Denied"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-2xl hover:bg-blue-500/30 hover:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <RefreshCw size={18} className={isRetrying ? "animate-spin" : ""} />
            <span>{isRetrying ? "Requesting..." : "Try Again"}</span>
          </button>

          {errorInfo?.type === "permission" && (
            <button
              onClick={() => {
                // Open browser settings (this will vary by browser)
                alert(
                  "Please click the camera/microphone icon in your browser's address bar to manage permissions."
                );
              }}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gray-500/20 text-gray-300 border border-gray-500/30 rounded-2xl hover:bg-gray-500/30 hover:border-gray-500/50 transition-all duration-200"
            >
              <Settings size={18} />
              <span>Browser Settings</span>
            </button>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <p className="text-gray-400 text-xs">
            {errorInfo?.type === "permission" ? (
              <>
                💡 Look for the camera/microphone icon in your browser's address
                bar and click "Allow"
              </>
            ) : errorInfo?.type === "device" ? (
              <>
                🔌 Make sure your camera and microphone are properly connected
              </>
            ) : (
              <>
                ❓ If the problem persists, try refreshing the page or using a
                different browser
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PermissionRequest;
