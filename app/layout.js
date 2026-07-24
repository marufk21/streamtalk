import "./globals.css";
import { SocketProviderWrapper } from "./providers";

export const metadata = {
  title: "StreamTalk — Private video calls",
  description: "Instant, secure video calls with no sign-up required.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body>
        <SocketProviderWrapper>{children}</SocketProviderWrapper>
      </body>
    </html>
  );
}
