import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
    const socket = useContext(SocketContext);
    return socket;
}

export const SocketProvider = (props) => {
    const { children } = props;
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Establish a connection to the Socket.IO server
        const connection = io('https://streamtalk.onrender.com/');

        console.log("Socket connection", connection);
        setSocket(connection);

        // Handle connection error
        connection.on('connect_error', async (err) => {
            console.log("Error establishing socket", err);
            await fetch('/api/socket'); 
        });

        // Cleanup on unmount
        return () => {
            connection.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
