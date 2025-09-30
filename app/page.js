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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white px-4">
      <h1 className="text-4xl font-bold mb-6 text-red-500">Stream Talk</h1>

      <div className="flex flex-col items-center gap-4 w-full max-w-md bg-gray-800 shadow-lg rounded-lg p-6">
        <input
          className="w-full p-3 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e?.target?.value)}
        />
        <button
          onClick={joinRoom}
          className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition"
        >
          Join Room
        </button>
      </div>

      <span className="text-gray-400 mt-6 mb-4">
        --------------- OR ---------------
      </span>

      <button
        onClick={createAndJoin}
        className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
      >
        Create a new room
      </button>
    </div>
  );
}
