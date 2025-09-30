"use client";

import { SocketProvider } from "@/store/socket";

export function SocketProviderWrapper({ children }) {
  return <SocketProvider>{children}</SocketProvider>;
}
