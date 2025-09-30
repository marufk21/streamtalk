"use client";

import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");

  const createAndJoin = () => {
    const roomId = uuidv4();
    router.push(`/${roomId}`);
  };

  const joinRoom = () => {
    if (roomId) router.push(`/${roomId}`);
    else {
      alert("Please provide a valid room id");
    }
  };

  return (
    <div className="py-8 min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Hero section */}
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-red-400 via-purple-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
            Stream Talk
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-2xl">
            Connect instantly with crystal-clear video calls
          </p>
          <p className="text-lg text-gray-400 max-w-xl">
            Experience seamless communication with our modern video streaming
            platform
          </p>
        </div>

        {/* Main action cards */}
        <div className="flex flex-col lg:flex-row gap-8 w-full max-w-4xl">
          {/* Join Room Card */}
          <div className="flex-1 bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Join Room</h3>
              <p className="text-gray-300">
                Enter a room ID to join an existing call
              </p>
            </div>

            <div className="space-y-4">
              <input
                className="w-full p-4 bg-white/5 border border-white/20 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-gray-400 backdrop-blur-sm transition-all"
                placeholder="Enter Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e?.target?.value)}
              />
              <button
                onClick={joinRoom}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-4 px-6 rounded-2xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Join Room
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center justify-center lg:flex-col">
            <div className="hidden lg:block w-px h-24 bg-gradient-to-b from-transparent via-gray-400 to-transparent"></div>
            <span className="lg:hidden text-gray-400 text-xl font-light px-4">
              OR
            </span>
            <span className="hidden lg:block text-gray-400 text-lg font-light py-4">
              OR
            </span>
            <div className="hidden lg:block w-px h-24 bg-gradient-to-b from-transparent via-gray-400 to-transparent"></div>
          </div>

          {/* Create Room Card */}
          <div className="flex-1 bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Create Room
              </h3>
              <p className="text-gray-300">
                Start a new call and invite others
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 border border-white/20 rounded-2xl p-4 backdrop-blur-sm">
                <p className="text-gray-300 text-sm mb-2">
                  ✨ Instant room creation
                </p>
                <p className="text-gray-300 text-sm mb-2">
                  🔒 Secure connections
                </p>
                <p className="text-gray-300 text-sm">📱 Multi-device support</p>
              </div>
              <button
                onClick={createAndJoin}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 px-6 rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Create New Room
              </button>
            </div>
          </div>
        </div>

        {/* Features section */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-8">
            Trusted by thousands of users worldwide
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>HD Video Quality</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Real-time Chat</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Screen Sharing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Secure & Private</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
