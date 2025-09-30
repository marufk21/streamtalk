import { useState, useRef, useEffect } from "react";
import {
  Send,
  MessageCircle,
  X,
  Users,
  Smile,
  Paperclip,
  MoreHorizontal,
} from "lucide-react";

const ModernChat = ({
  messages = [],
  onSendMessage,
  isConnected = false,
  connectedPeers = [],
  myId,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !isConnected) return;

    const success = onSendMessage(messageInput);
    if (success !== false) {
      setMessageInput("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`fixed bottom-24 right-6 z-40 ${className}`}>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="relative group"
          title={isConnected ? "Open Chat" : "Chat Disconnected"}
        >
          <div
            className={`p-4 rounded-2xl backdrop-blur-xl border transition-all duration-300 shadow-2xl ${
              isConnected
                ? "bg-blue-500/20 border-blue-500/30 hover:bg-blue-500/30 text-blue-400"
                : "bg-gray-500/20 border-gray-500/30 hover:bg-gray-500/30 text-gray-400"
            }`}
          >
            <MessageCircle size={24} />

            {/* Message Count Badge */}
            {messages.length > 0 && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg">
                {messages.length > 99 ? "99+" : messages.length}
              </div>
            )}

            {/* Pulse animation for new messages */}
            {messages.length > 0 && (
              <div className="absolute inset-0 bg-blue-400/20 rounded-2xl animate-ping" />
            )}
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl w-96 h-[500px] flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/10 rounded-xl">
                <MessageCircle size={20} className="text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Chat</h3>
                {isConnected && (
                  <div className="flex items-center space-x-1 text-blue-300 text-xs">
                    <Users size={12} />
                    <span>{connectedPeers.length} participants</span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors text-gray-300 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Connection Status */}
          {!isConnected && (
            <div className="p-3 bg-yellow-500/10 border-b border-yellow-500/20">
              <div className="flex items-center space-x-2 text-yellow-400 text-sm">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                <span>Waiting for peers to connect...</span>
              </div>
            </div>
          )}

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 text-sm mt-16">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle size={32} className="opacity-50" />
                </div>
                <p className="font-medium">No messages yet</p>
                <p className="text-xs mt-1 opacity-75">
                  Start the conversation!
                </p>
              </div>
            ) : (
              messages.map((message, index) => {
                const showAvatar =
                  index === 0 ||
                  messages[index - 1]?.senderName !== message.senderName;

                return (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.isOwn ? "justify-end" : "justify-start"
                    } group`}
                  >
                    <div
                      className={`flex items-end space-x-2 max-w-xs ${
                        message.isOwn ? "flex-row-reverse space-x-reverse" : ""
                      }`}
                    >
                      {/* Avatar */}
                      {!message.isOwn && showAvatar && (
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {message.senderName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {!message.isOwn && !showAvatar && <div className="w-8" />}

                      {/* Message Bubble */}
                      <div
                        className={`relative px-4 py-3 rounded-2xl transition-all duration-200 ${
                          message.isOwn
                            ? "bg-blue-500/30 text-white border border-blue-500/30 rounded-br-md"
                            : "bg-white/10 text-gray-100 border border-white/10 rounded-bl-md"
                        }`}
                      >
                        {!message.isOwn && showAvatar && (
                          <div className="text-xs font-medium text-blue-300 mb-1">
                            {message.senderName}
                          </div>
                        )}
                        <div className="break-words text-sm leading-relaxed">
                          {message.text}
                        </div>
                        <div
                          className={`text-xs mt-1 opacity-60 ${
                            message.isOwn ? "text-blue-100" : "text-gray-400"
                          }`}
                        >
                          {formatTimestamp(message.timestamp)}
                        </div>

                        {/* Message tail */}
                        <div
                          className={`absolute bottom-0 w-3 h-3 ${
                            message.isOwn
                              ? "right-0 bg-blue-500/30 border-r border-b border-blue-500/30"
                              : "left-0 bg-white/10 border-l border-b border-white/10"
                          }`}
                          style={{
                            clipPath: message.isOwn
                              ? "polygon(0 0, 100% 100%, 0 100%)"
                              : "polygon(100% 0, 100% 100%, 0 100%)",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Typing Indicator */}
          {isTyping && (
            <div className="px-4 py-2 text-gray-400 text-sm">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
                <span>Someone is typing...</span>
              </div>
            </div>
          )}

          {/* Message Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-white/10"
          >
            <div className="flex items-center space-x-3">
              {/* Emoji Button */}
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
                title="Add emoji"
              >
                <Smile size={18} />
              </button>

              {/* Input Field */}
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    isConnected
                      ? "Type a message..."
                      : "Waiting for connection..."
                  }
                  disabled={!isConnected}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-blue-500/50 focus:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-gray-400 transition-all duration-200"
                  maxLength={500}
                />
                {messageInput.length > 450 && (
                  <div className="absolute -top-6 right-0 text-xs text-gray-400">
                    {500 - messageInput.length} left
                  </div>
                )}
              </div>

              {/* Send Button */}
              <button
                type="submit"
                disabled={!messageInput.trim() || !isConnected}
                className="p-3 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-2xl hover:bg-blue-500/30 hover:border-blue-500/50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group"
                title="Send message"
              >
                <Send
                  size={18}
                  className="group-hover:translate-x-0.5 transition-transform duration-200"
                />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ModernChat;
