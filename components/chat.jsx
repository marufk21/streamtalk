import { useState, useRef, useEffect } from "react";
import { Send, MessageCircle, X, Users } from "lucide-react";

/**
 * Chat component for real-time messaging
 * @param {Object} props - Component props
 * @param {Array} props.messages - Array of chat messages
 * @param {Function} props.onSendMessage - Function to send a message
 * @param {boolean} props.isConnected - Whether chat is connected
 * @param {Array} props.connectedPeers - Array of connected peer IDs
 * @param {string} props.myId - Current user's ID
 */
const Chat = ({ messages = [], onSendMessage, isConnected = false, connectedPeers = [], myId }) => {
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
      inputRef.current.focus();
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
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-20 right-4 z-50">
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className={`relative p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105 ${
            isConnected 
              ? "bg-blue-500 hover:bg-blue-600 text-white" 
              : "bg-gray-500 hover:bg-gray-600 text-gray-300"
          }`}
          title={isConnected ? "Open Chat" : "Chat Disconnected"}
        >
          <MessageCircle size={24} />
          {messages.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
              {messages.length > 99 ? "99+" : messages.length}
            </span>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-xl border border-gray-300 w-80 h-96 flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-3 bg-blue-500 text-white rounded-t-lg">
            <div className="flex items-center space-x-2">
              <MessageCircle size={20} />
              <span className="font-medium">Chat</span>
              {isConnected && (
                <div className="flex items-center space-x-1 text-blue-100">
                  <Users size={14} />
                  <span className="text-sm">{connectedPeers.length}</span>
                </div>
              )}
            </div>
            <button
              onClick={toggleChat}
              className="p-1 hover:bg-blue-600 rounded transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Connection Status */}
          {!isConnected && (
            <div className="p-2 bg-yellow-50 border-b border-yellow-200">
              <p className="text-yellow-700 text-sm text-center">
                💡 Waiting for peers to connect...
              </p>
            </div>
          )}

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 text-sm mt-8">
                <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
                <p>No messages yet.</p>
                <p className="text-xs mt-1">Start a conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      message.isOwn
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    {!message.isOwn && (
                      <div className="text-xs opacity-75 mb-1 font-medium">
                        {message.senderName}
                      </div>
                    )}
                    <div className="break-words">{message.text}</div>
                    <div
                      className={`text-xs mt-1 ${
                        message.isOwn ? "text-blue-100" : "text-gray-500"
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
          <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 bg-white rounded-b-lg">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isConnected ? "Type a message..." : "Waiting for connection..."}
                disabled={!isConnected}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                maxLength={500}
              />
              <button
                type="submit"
                disabled={!messageInput.trim() || !isConnected}
                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
            {messageInput.length > 450 && (
              <div className="text-xs text-gray-500 mt-1">
                {500 - messageInput.length} characters remaining
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

export default Chat;