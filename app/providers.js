"use client";

import { SocketProvider } from "@/context/socket";

export function SocketProviderWrapper({ children }) {
  return <SocketProvider>{children}</SocketProvider>;
}
