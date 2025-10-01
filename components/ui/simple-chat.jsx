import { useState, useRef, useEffect } from "react";
import { Send, MessageCircle, X, Users } from "lucide-react";

const SimpleChat = ({
  messages = [],
  onSendMessage,
  isConnected = false,
  connectedPeers = [],
  myId,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messageInput, setMessageInput] = useState("");
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
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`fixed bottom-24 right-4 z-40 ${className}`}>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="relative group"
          title={isConnected ? "Open Chat" : "Chat Disconnected"}
        >
          <div
            className={`p-3 rounded-2xl backdrop-blur-lg border transition-all duration-200 shadow-lg ${
              isConnected
                ? "bg-white/10 border-white/20 hover:bg-white/20 text-white transform hover:scale-105"
                : "bg-white/5 border-white/10 hover:bg-white/10 text-gray-300"
            }`}
          >
            <MessageCircle size={20} />

            {/* Message Count Badge */}
            {messages.length > 0 && (
              <div className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold text-[10px] shadow-lg">
                {messages.length > 9 ? "9+" : messages.length}
              </div>
            )}
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl w-80 h-96 flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-3 bg-white/5 backdrop-blur-sm border-b border-white/10 rounded-t-2xl">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-sm">
                <MessageCircle size={16} className="text-purple-400" />
              </div>
              <div>
                <h3 className="font-medium text-white text-sm">Chat</h3>
                {isConnected && (
                  <div className="flex items-center space-x-1 text-gray-200 text-xs">
                    <Users size={10} />
                    <span>{connectedPeers.length} online</span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors text-gray-200 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          {/* Connection Status */}
          {!isConnected && (
            <div className="p-2 bg-yellow-500/20 backdrop-blur-sm border-b border-yellow-500/30 text-yellow-300 text-xs text-center rounded-lg mx-2">
              💡 Waiting for connection...
            </div>
          )}

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-black/20 backdrop-blur-sm scrollbar-thin">
            {messages.length === 0 ? (
              <div className="text-center text-gray-300 text-sm mt-8">
                <MessageCircle
                  size={24}
                  className="mx-auto mb-2 opacity-50 text-purple-300"
                />
                <p>No messages yet</p>
                <p className="text-xs mt-1 opacity-75">Start chatting!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.isOwn ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-2xl text-sm backdrop-blur-sm shadow-lg ${
                      message.isOwn
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-md"
                        : "bg-white/10 text-gray-100 rounded-bl-md border border-white/20"
                    }`}
                  >
                    {!message.isOwn && (
                      <div className="text-xs text-purple-300 mb-1 font-medium">
                        {message.senderName}
                      </div>
                    )}
                    <div className="break-words">{message.text}</div>
                    <div
                      className={`text-xs mt-1 opacity-70 ${
                        message.isOwn ? "text-blue-100" : "text-gray-300"
                      }`}
                    >
                      {formatTimestamp(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t border-white/10 bg-white/5 backdrop-blur-sm rounded-b-2xl"
          >
            <div className="flex space-x-2">
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
                className="flex-1 px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                maxLength={300}
              />
              <button
                type="submit"
                disabled={!messageInput.trim() || !isConnected}
                className="px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg"
              >
                <Send size={14} />
              </button>
            </div>
            {messageInput.length > 250 && (
              <div className="text-xs text-gray-400 mt-1">
                {300 - messageInput.length} characters left
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

export default SimpleChat;
