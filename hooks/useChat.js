import { useState, useEffect, useCallback, useRef } from "react";
import { cloneDeep } from "lodash";

/**
 * Custom hook for managing chat functionality within WebRTC peer connections
 * Integrates with existing PeerJS connections to add real-time messaging
 * 
 * @param {Object} peer - PeerJS instance
 * @param {string} myId - Current user's peer ID
 * @param {Object} users - Object containing user connections from usePlayer
 * @returns {Object} Chat functionality and state
 */
const useChat = (peer, myId, users = {}) => {
  // Chat messages state
  const [messages, setMessages] = useState([]);
  // Data channels for each peer
  const [dataChannels, setDataChannels] = useState({});
  // Track which peers have data channels established
  const [connectedPeers, setConnectedPeers] = useState(new Set());
  // Ref to prevent duplicate channel creation
  const channelCreationRef = useRef(new Set());

  /**
   * Add a message to the chat
   * @param {Object} message - Message object
   */
  const addMessage = useCallback((message) => {
    const newMessage = {
      id: message.id || `${Date.now()}-${Math.random()}`,
      text: message.text,
      senderId: message.senderId,
      senderName: message.senderName || message.senderId,
      timestamp: message.timestamp || new Date().toISOString(),
      isOwn: message.senderId === myId
    };

    setMessages(prev => {
      // Prevent duplicate messages
      const exists = prev.some(msg => msg.id === newMessage.id);
      if (exists) return prev;
      return [...prev, newMessage];
    });
  }, [myId]);

  /**
   * Send a text message to all connected peers
   * @param {string} messageText - The message text to send
   */
  const sendMessage = useCallback((messageText) => {
    if (!messageText || !messageText.trim()) return false;

    const message = {
      id: `${myId}-${Date.now()}-${Math.random()}`,
      text: messageText.trim(),
      senderId: myId,
      senderName: myId,
      timestamp: new Date().toISOString(),
      type: 'chat-message'
    };

    // Add to local messages immediately
    addMessage(message);

    // Send to all connected peers
    let sentCount = 0;
    Object.entries(dataChannels).forEach(([peerId, channel]) => {
      if (channel && channel.readyState === 'open') {
        try {
          channel.send(JSON.stringify(message));
          sentCount++;
        } catch (error) {
          console.error(`Failed to send message to peer ${peerId}:`, error);
        }
      }
    });

    console.log(`Message sent to ${sentCount} peers`);
    return sentCount > 0;
  }, [myId, dataChannels, addMessage]);

  /**
   * Handle incoming data channel messages
   * @param {MessageEvent} event - The message event from data channel
   */
  const handleIncomingMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === 'chat-message') {
        // Validate message structure
        if (data.senderId && data.text && data.id) {
          addMessage(data);
        }
      }
    } catch (error) {
      console.error('Error parsing incoming message:', error);
    }
  }, [addMessage]);

  /**
   * Create and setup a data channel for a peer
   * @param {string} peerId - The peer ID
   * @param {RTCPeerConnection} peerConnection - The RTCPeerConnection instance
   * @param {boolean} isInitiator - Whether this peer should create the channel
   */
  const setupDataChannel = useCallback((peerId, peerConnection, isInitiator = false) => {
    // Prevent duplicate channel creation
    const channelKey = `${myId}-${peerId}`;
    if (channelCreationRef.current.has(channelKey)) {
      return;
    }
    channelCreationRef.current.add(channelKey);

    let dataChannel;

    const setupChannelEvents = (channel) => {
      channel.onopen = () => {
        console.log(`💬 Data channel opened with peer ${peerId}`);
        setDataChannels(prev => ({ ...prev, [peerId]: channel }));
        setConnectedPeers(prev => new Set([...prev, peerId]));
      };

      channel.onclose = () => {
        console.log(`💬 Data channel closed with peer ${peerId}`);
        setDataChannels(prev => {
          const updated = cloneDeep(prev);
          delete updated[peerId];
          return updated;
        });
        setConnectedPeers(prev => {
          const updated = new Set(prev);
          updated.delete(peerId);
          return updated;
        });
        channelCreationRef.current.delete(channelKey);
      };

      channel.onerror = (error) => {
        console.error(`💬 Data channel error with peer ${peerId}:`, error);
      };

      channel.onmessage = handleIncomingMessage;
    };

    if (isInitiator) {
      // Create data channel as the initiator
      try {
        dataChannel = peerConnection.createDataChannel('chat', {
          ordered: true,
          maxRetransmits: 3
        });
        setupChannelEvents(dataChannel);
        console.log(`💬 Created data channel for peer ${peerId}`);
      } catch (error) {
        console.error(`💬 Failed to create data channel for peer ${peerId}:`, error);
        channelCreationRef.current.delete(channelKey);
      }
    } else {
      // Listen for incoming data channel
      const handleDataChannel = (event) => {
        dataChannel = event.channel;
        if (dataChannel.label === 'chat') {
          setupChannelEvents(dataChannel);
          console.log(`💬 Received data channel from peer ${peerId}`);
        }
      };

      peerConnection.ondatachannel = handleDataChannel;
    }
  }, [myId, handleIncomingMessage]);

  /**
   * Clean up data channel for a specific peer
   * @param {string} peerId - The peer ID to clean up
   */
  const cleanupPeerDataChannel = useCallback((peerId) => {
    const channel = dataChannels[peerId];
    if (channel) {
      try {
        channel.close();
      } catch (error) {
        console.error(`Error closing data channel for peer ${peerId}:`, error);
      }
    }

    setDataChannels(prev => {
      const updated = cloneDeep(prev);
      delete updated[peerId];
      return updated;
    });

    setConnectedPeers(prev => {
      const updated = new Set(prev);
      updated.delete(peerId);
      return updated;
    });

    const channelKey = `${myId}-${peerId}`;
    channelCreationRef.current.delete(channelKey);
  }, [dataChannels, myId]);

  /**
   * Clear all chat messages
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Effect to setup data channels when new users connect
  useEffect(() => {
    if (!peer || !myId) return;

    Object.entries(users).forEach(([peerId, call]) => {
      // Skip if we already have a data channel for this peer
      if (dataChannels[peerId] || !call?.peerConnection) {
        return;
      }

      // Determine who should initiate the data channel
      // Use consistent logic: peer with "larger" ID creates the channel
      const shouldInitiate = myId > peerId;
      
      console.log(`💬 Setting up data channel with ${peerId}, initiating: ${shouldInitiate}`);
      setupDataChannel(peerId, call.peerConnection, shouldInitiate);
    });
  }, [peer, myId, users, dataChannels, setupDataChannel]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Cleanup all data channels on unmount
      Object.entries(dataChannels).forEach(([peerId, channel]) => {
        try {
          channel.close();
        } catch (error) {
          console.error(`Error closing data channel for peer ${peerId}:`, error);
        }
      });
    };
  }, []);

  return {
    // State
    messages,
    connectedPeers: Array.from(connectedPeers),
    isConnected: connectedPeers.size > 0,
    
    // Actions
    sendMessage,
    addMessage,
    clearMessages,
    cleanupPeerDataChannel,
    
    // Utility
    messageCount: messages.length,
    hasMessages: messages.length > 0
  };
};

export default useChat;