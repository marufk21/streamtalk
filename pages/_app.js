import "@/styles/globals.css";
import { SocketProvider } from "@/context/socket";
import Head from "next/head";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>StreamTalk</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <SocketProvider>
        <Component {...pageProps} />
      </SocketProvider>
    </>
  );
}
