import "@/styles/globals.css";
import { SocketProviderWrapper } from "./providers";

export const metadata = {
  title: "StreamTalk",
  description: "Real-time streaming and chat application",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SocketProviderWrapper>{children}</SocketProviderWrapper>
      </body>
    </html>
  );
}
