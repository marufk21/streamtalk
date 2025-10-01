// For App Router compatibility - Simple route handler for Socket.IO
import { NextResponse } from "next/server";

export async function GET(request) {
  return new NextResponse("Socket.IO server running via server.js", {
    status: 200,
  });
}

export async function POST(request) {
  return new NextResponse("Socket.IO server running via server.js", {
    status: 200,
  });
}
