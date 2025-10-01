"use client";

import { useEffect, useState } from "react";
import { cloneDeep } from "lodash";
import { useParams } from "next/navigation";

import { useSocket } from "@/store/socket";
import usePeer from "@/hooks/use-peer";
import useMediaStream from "@/hooks/use-media-stream";
import usePlayer from "@/hooks/use-player";
import useChat from "@/hooks/use-chat";

import CopySection from "@/components/copy-section";

// Modern UI Components
import SimpleCallLayout from "@/components/ui/simple-call-layout";
import FloatingControls from "@/components/ui/floating-controls";
import SimpleVideoGrid from "@/components/ui/simple-video-grid";
import SimpleChat from "@/components/ui/simple-chat";
import PermissionRequest from "@/components/ui/permission-request";
import AudioTroubleshooter from "@/components/ui/audio-troubleshooter";

const Room = () => {
  const socket = useSocket();
  const { roomId } = useParams(); // Client Components can still use useParams() directly
  const { peer, myId } = usePeer();
  const {
    stream,
    isAudioEnabled,
    isVideoEnabled,
    toggleAudio: toggleStreamAudio,
    toggleVideo: toggleStreamVideo,
    error: mediaError,
    permissions,
    audioDevices,
    selectedAudioInput,
    selectedAudioOutput,
    switchAudioInput,
    switchAudioOutput,
  } = useMediaStream();
  const {
    players,
    setPlayers,
    playerHighlighted,
    nonHighlightedPlayers,
    toggleAudio,
    toggleVideo,
    leaveRoom,
  } = usePlayer(myId, roomId, peer, {
    toggleAudio: toggleStreamAudio,
    toggleVideo: toggleStreamVideo,
    isAudioEnabled,
    isVideoEnabled,
  });

  const [users, setUsers] = useState([]);
  const [callStartTime] = useState(Date.now());
  const [callDuration, setCallDuration] = useState(0);
  const [showTroubleshooter, setShowTroubleshooter] = useState(false);

  // Initialize chat functionality
  const {
    messages,
    connectedPeers,
    isConnected: isChatConnected,
    sendMessage,
    cleanupPeerDataChannel,
  } = useChat(peer, myId, users);

  // Call duration timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - callStartTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [callStartTime]);

  // Add yourself to players when stream is ready
  useEffect(() => {
    if (myId && stream) {
      setPlayers((prev) => ({
        ...prev,
        [myId]: {
          url: stream,
          muted: true, // Always mute own audio to prevent feedback
          playing: isVideoEnabled,
          audioEnabled: isAudioEnabled, // Track actual audio state
        },
      }));
    }
  }, [myId, stream, isAudioEnabled, isVideoEnabled, setPlayers]);

  // Enhanced retry media stream with audio diagnostics
  const retryMediaStream = async () => {
    if (process.env.NODE_ENV === "development") {
      const { quickAudioCheck } = await import("@/utils/audio-diagnostics");
      console.log("🔍 Running audio diagnostics before retry...");
      await quickAudioCheck();
    }
    window.location.reload();
  };

  useEffect(() => {
    if (!socket || !peer || !stream) return;

    const handleUserConnected = (newUser) => {
      console.log(`user connected in room with userId ${newUser}`);
      const call = peer.call(newUser, stream);

      call.on("stream", (incomingStream) => {
        console.log(`incoming stream from ${newUser}`);
        setPlayers((prev) => ({
          ...prev,
          [newUser]: {
            url: incomingStream,
            muted: false, // Allow remote audio to be heard
            playing: true,
            audioEnabled: true, // Track actual audio state
          },
        }));

        setUsers((prev) => ({
          ...prev,
          [newUser]: call,
        }));
      });

      // Handle call close event for outgoing calls
      call.on("close", () => {
        console.log(`Outgoing call closed with ${newUser}`);
        setPlayers((prev) => {
          const copy = cloneDeep(prev);
          delete copy[newUser];
          return copy;
        });

        setUsers((prev) => {
          const copy = cloneDeep(prev);
          delete copy[newUser];
          return copy;
        });
      });

      // Handle call error event for outgoing calls
      call.on("error", (error) => {
        console.error(`Outgoing call error with ${newUser}:`, error);
        setPlayers((prev) => {
          const copy = cloneDeep(prev);
          delete copy[newUser];
          return copy;
        });

        setUsers((prev) => {
          const copy = cloneDeep(prev);
          delete copy[newUser];
          return copy;
        });
      });
    };

    socket.on("user-connected", handleUserConnected);

    return () => {
      socket.off("user-connected", handleUserConnected);
    };
  }, [peer, setPlayers, socket, stream]);

  useEffect(() => {
    if (!socket) return;

    const handleToggleAudio = (userId) => {
      console.log(`user with id ${userId} toggled audio`);
      setPlayers((prev) => {
        const copy = cloneDeep(prev);
        if (copy[userId]) {
          // Toggle the audioEnabled state for display purposes
          copy[userId].audioEnabled = !copy[userId].audioEnabled;
          // Set muted based on audioEnabled state - if audio is disabled, mute it
          copy[userId].muted = !copy[userId].audioEnabled;
        }
        return { ...copy };
      });
    };

    const handleToggleVideo = (userId) => {
      console.log(`user with id ${userId} toggled video`);
      setPlayers((prev) => {
        const copy = cloneDeep(prev);
        copy[userId].playing = !copy[userId].playing;
        return { ...copy };
      });
    };

    const handleUserLeave = (userId) => {
      console.log(`user ${userId} is leaving the room`);

      // Clean up chat data channel for leaving user
      cleanupPeerDataChannel(userId);

      // Clean up peer connection
      if (users[userId]) {
        users[userId].close();
      }

      // Remove from players state
      setPlayers((prev) => {
        const copy = cloneDeep(prev);
        delete copy[userId];
        return copy;
      });

      // Remove from users state
      setUsers((prev) => {
        const copy = cloneDeep(prev);
        delete copy[userId];
        return copy;
      });
    };

    socket.on("user-toggle-audio", handleToggleAudio);
    socket.on("user-toggle-video", handleToggleVideo);
    socket.on("user-leave", handleUserLeave);

    return () => {
      socket.off("user-toggle-audio", handleToggleAudio);
      socket.off("user-toggle-video", handleToggleVideo);
      socket.off("user-leave", handleUserLeave);
    };
  }, [players, setPlayers, socket, users, cleanupPeerDataChannel]);

  useEffect(() => {
    if (!peer || !stream) return;

    peer.on("call", (call) => {
      const { peer: callerId } = call;
      call.answer(stream);

      call.on("stream", (incomingStream) => {
        console.log(`incoming stream from ${callerId}`);
        setPlayers((prev) => ({
          ...prev,
          [callerId]: {
            url: incomingStream,
            muted: false, // Allow remote audio to be heard
            playing: true,
            audioEnabled: true, // Track actual audio state
          },
        }));

        setUsers((prev) => ({
          ...prev,
          [callerId]: call,
        }));
      });

      // Handle call close event
      call.on("close", () => {
        console.log(`Call closed with ${callerId}`);
        // Remove from players and users when call is closed
        setPlayers((prev) => {
          const copy = cloneDeep(prev);
          delete copy[callerId];
          return copy;
        });

        setUsers((prev) => {
          const copy = cloneDeep(prev);
          delete copy[callerId];
          return copy;
        });
      });

      // Handle call error event
      call.on("error", (error) => {
        console.error(`Call error with ${callerId}:`, error);
        // Remove from players and users on error
        setPlayers((prev) => {
          const copy = cloneDeep(prev);
          delete copy[callerId];
          return copy;
        });

        setUsers((prev) => {
          const copy = cloneDeep(prev);
          delete copy[callerId];
          return copy;
        });
      });
    });
  }, [peer, setPlayers, stream]);

  useEffect(() => {
    if (!stream || !myId) return;

    console.log(`setting my stream ${myId}`);
    setPlayers((prev) => ({
      ...prev,
      [myId]: {
        url: stream,
        muted: true, // Always mute own audio to prevent feedback
        playing: isVideoEnabled, // Use actual video state
      },
    }));
  }, [myId, setPlayers, stream, isVideoEnabled]); // Removed isAudioEnabled dependency

  // Apply audio output device to all players when it changes
  useEffect(() => {
    if (selectedAudioOutput && selectedAudioOutput !== 'default') {
      // Apply to all video elements in the page
      const videoElements = document.querySelectorAll('video');
      videoElements.forEach(video => {
        if (video.setSinkId) {
          video.setSinkId(selectedAudioOutput).catch(err => {
            console.warn('Failed to set audio output device:', err);
          });
        }
      });
    }
  }, [selectedAudioOutput]);

  return (
    <>
      {/* Permission Request Overlay */}
      {(mediaError || !permissions.audio || !permissions.video) && (
        <PermissionRequest
          error={mediaError}
          permissions={permissions}
          onRetry={retryMediaStream}
        />
      )}

      <SimpleCallLayout
        roomId={roomId}
        participants={Object.keys(players)}
        onShare={() => {
          if (navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href);
          }
        }}
      >
        {/* Main Video Area */}
        <div className="h-full flex flex-col">
          {/* Video Grid */}
          <div className="flex-1 p-4 pb-24 overflow-hidden">
            <SimpleVideoGrid
              players={players}
              highlightedPlayerId={
                playerHighlighted
                  ? Object.keys(players).find(
                      (id) => players[id] === playerHighlighted
                    )
                  : null
              }
              onPlayerClick={(playerId) => {
                console.log(`Player ${playerId} clicked`);
              }}
              myId={myId}
              isAudioEnabled={isAudioEnabled} // Pass actual audio state
              selectedAudioOutput={selectedAudioOutput} // Pass selected audio output
              className="h-full"
            />
          </div>

          {/* Room ID Copy Section - Hidden */}
          <div className="hidden">
            <CopySection roomId={roomId} />
          </div>
        </div>

        {/* Floating Controls */}
        {myId && socket && (
          <FloatingControls
            muted={!isAudioEnabled} // When audio is OFF, show as muted
            playing={isVideoEnabled}
            toggleAudio={toggleAudio}
            toggleVideo={toggleVideo}
            leaveRoom={leaveRoom}
            onTroubleshoot={() => setShowTroubleshooter(true)}
          />
        )}

        {/* Simple Chat Component */}
        {myId && (
          <SimpleChat
            messages={messages}
            onSendMessage={sendMessage}
            isConnected={isChatConnected}
            connectedPeers={connectedPeers}
            myId={myId}
          />
        )}

        {/* Audio Troubleshooter */}
        <AudioTroubleshooter
          isOpen={showTroubleshooter}
          onClose={() => setShowTroubleshooter(false)}
          onFixApplied={() => {
            // Optionally refresh media stream after fixes
            console.log("Audio fixes applied");
          }}
          audioDevices={audioDevices}
          selectedAudioInput={selectedAudioInput}
          selectedAudioOutput={selectedAudioOutput}
          switchAudioInput={switchAudioInput}
          switchAudioOutput={switchAudioOutput}
        />
      </SimpleCallLayout>
    </>
  );
};

export default Room;