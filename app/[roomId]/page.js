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

  // Retry media stream on permission error
  const retryMediaStream = async () => {
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
            muted: true,
            playing: true,
          },
        }));

        setUsers((prev) => ({
          ...prev,
          [newUser]: call,
        }));
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
        copy[userId].muted = !copy[userId].muted;
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
      users[userId]?.close();
      const playersCopy = cloneDeep(players);
      delete playersCopy[userId];
      setPlayers(playersCopy);
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
            muted: true,
            playing: true,
          },
        }));

        setUsers((prev) => ({
          ...prev,
          [callerId]: call,
        }));
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
      </SimpleCallLayout>
    </>
  );
};

export default Room;
