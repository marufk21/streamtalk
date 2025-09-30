import { useState, useEffect } from "react";
import {
  UserPlus,
  UserMinus,
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneCall,
  PhoneOff,
  Wifi,
  WifiOff,
  X,
  Volume2,
  VolumeX,
} from "lucide-react";

const CallNotifications = ({
  notifications = [],
  onDismiss,
  autoHide = true,
  autoHideDelay = 5000,
  className = "",
}) => {
  const [visibleNotifications, setVisibleNotifications] = useState([]);

  useEffect(() => {
    setVisibleNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    if (!autoHide) return;

    const timers = visibleNotifications.map((notification, index) => {
      return setTimeout(() => {
        handleDismiss(notification.id);
      }, autoHideDelay + index * 1000); // Stagger dismissal
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [visibleNotifications, autoHide, autoHideDelay]);

  const handleDismiss = (notificationId) => {
    setVisibleNotifications((prev) =>
      prev.filter((notification) => notification.id !== notificationId)
    );
    onDismiss?.(notificationId);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "user-joined":
        return <UserPlus size={20} className="text-green-400" />;
      case "user-left":
        return <UserMinus size={20} className="text-red-400" />;
      case "mic-on":
        return <Mic size={20} className="text-green-400" />;
      case "mic-off":
        return <MicOff size={20} className="text-red-400" />;
      case "video-on":
        return <Video size={20} className="text-blue-400" />;
      case "video-off":
        return <VideoOff size={20} className="text-gray-400" />;
      case "call-started":
        return <PhoneCall size={20} className="text-green-400" />;
      case "call-ended":
        return <PhoneOff size={20} className="text-red-400" />;
      case "connection-lost":
        return <WifiOff size={20} className="text-red-400" />;
      case "connection-restored":
        return <Wifi size={20} className="text-green-400" />;
      case "volume-changed":
        return <Volume2 size={20} className="text-blue-400" />;
      case "volume-muted":
        return <VolumeX size={20} className="text-gray-400" />;
      default:
        return <PhoneCall size={20} className="text-blue-400" />;
    }
  };

  const getNotificationColor = (type, priority = "normal") => {
    if (priority === "high") {
      return "border-red-500/50 bg-red-500/10";
    }

    switch (type) {
      case "user-joined":
      case "mic-on":
      case "video-on":
      case "call-started":
      case "connection-restored":
        return "border-green-500/30 bg-green-500/10";
      case "user-left":
      case "mic-off":
      case "call-ended":
      case "connection-lost":
        return "border-red-500/30 bg-red-500/10";
      case "video-off":
      case "volume-muted":
        return "border-gray-500/30 bg-gray-500/10";
      default:
        return "border-blue-500/30 bg-blue-500/10";
    }
  };

  const NotificationItem = ({ notification, index }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
      // Entrance animation
      const timer = setTimeout(() => setIsVisible(true), index * 200);
      return () => clearTimeout(timer);
    }, [index]);

    const handleClose = () => {
      setIsExiting(true);
      setTimeout(() => {
        handleDismiss(notification.id);
      }, 300);
    };

    return (
      <div
        className={`transform transition-all duration-500 ease-out ${
          isVisible && !isExiting
            ? "translate-x-0 opacity-100 scale-100"
            : "translate-x-full opacity-0 scale-95"
        }`}
        style={{ transitionDelay: `${index * 100}ms` }}
      >
        <div
          className={`relative flex items-start space-x-3 p-4 backdrop-blur-xl border rounded-2xl shadow-2xl ${getNotificationColor(
            notification.type,
            notification.priority
          )}`}
        >
          {/* Icon */}
          <div className="flex-shrink-0 pt-1">
            {getNotificationIcon(notification.type)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white font-medium text-sm leading-tight">
                  {notification.title}
                </p>
                {notification.message && (
                  <p className="text-gray-300 text-xs mt-1 leading-relaxed">
                    {notification.message}
                  </p>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={handleClose}
                className="ml-2 p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 flex-shrink-0"
                title="Dismiss"
              >
                <X size={14} />
              </button>
            </div>

            {/* Timestamp */}
            {notification.timestamp && (
              <p className="text-gray-500 text-xs mt-2">
                {new Date(notification.timestamp).toLocaleTimeString()}
              </p>
            )}

            {/* Action Buttons */}
            {notification.actions && (
              <div className="flex space-x-2 mt-3">
                {notification.actions.map((action, actionIndex) => (
                  <button
                    key={actionIndex}
                    onClick={() => {
                      action.onClick?.();
                      if (action.dismiss) handleClose();
                    }}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-all duration-200 ${
                      action.primary
                        ? "bg-blue-500/30 text-blue-300 hover:bg-blue-500/40"
                        : "bg-white/10 text-gray-300 hover:bg-white/20"
                    }`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Progress Bar for Auto-hide */}
          {autoHide && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 rounded-b-2xl overflow-hidden">
              <div
                className="h-full bg-white/30 rounded-b-2xl animate-shrink-width"
                style={{
                  animationDuration: `${autoHideDelay}ms`,
                  animationDelay: `${index * 1000}ms`,
                }}
              />
            </div>
          )}

          {/* Glow Effect for High Priority */}
          {notification.priority === "high" && (
            <div className="absolute inset-0 bg-red-400/20 rounded-2xl animate-pulse pointer-events-none" />
          )}
        </div>
      </div>
    );
  };

  if (visibleNotifications.length === 0) return null;

  return (
    <div className={`fixed top-6 right-6 z-50 space-y-3 max-w-sm ${className}`}>
      {visibleNotifications.map((notification, index) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          index={index}
        />
      ))}

      {/* Global Notification Styles */}
      <style jsx>{`
        @keyframes shrink-width {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
        .animate-shrink-width {
          animation: shrink-width linear forwards;
        }
      `}</style>
    </div>
  );
};

// Utility function to create notifications
export const createNotification = (type, title, options = {}) => {
  return {
    id:
      options.id ||
      `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    title,
    message: options.message,
    timestamp: options.timestamp || Date.now(),
    priority: options.priority || "normal",
    actions: options.actions,
    ...options,
  };
};

// Predefined notification creators
export const NotificationCreators = {
  userJoined: (username) =>
    createNotification("user-joined", `${username} joined the call`, {
      message: "New participant is now connected",
      priority: "normal",
    }),

  userLeft: (username) =>
    createNotification("user-left", `${username} left the call`, {
      message: "Participant has disconnected",
      priority: "normal",
    }),

  micToggled: (username, isMuted) =>
    createNotification(
      isMuted ? "mic-off" : "mic-on",
      `${username} ${isMuted ? "muted" : "unmuted"} their microphone`,
      { priority: "low" }
    ),

  videoToggled: (username, isVideoOff) =>
    createNotification(
      isVideoOff ? "video-off" : "video-on",
      `${username} turned ${isVideoOff ? "off" : "on"} their camera`,
      { priority: "low" }
    ),

  connectionLost: () =>
    createNotification("connection-lost", "Connection lost", {
      message: "Attempting to reconnect...",
      priority: "high",
      actions: [
        {
          label: "Retry",
          primary: true,
          onClick: () => window.location.reload(),
          dismiss: true,
        },
      ],
    }),

  connectionRestored: () =>
    createNotification("connection-restored", "Connection restored", {
      message: "You're back online",
      priority: "normal",
    }),
};

export default CallNotifications;
