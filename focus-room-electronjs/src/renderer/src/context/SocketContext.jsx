import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

// Use the current hostname so it works both on localhost and network
const getSocketUrl = () => {
    // 1. Try environment variable
    if (import.meta.env.VITE_SOCKET_URL) {
        return import.meta.env.VITE_SOCKET_URL;
    }

    // 2. Check if we are in Electron production (file protocol or empty hostname)
    const hostname = window.location.hostname;
    if (!hostname || hostname === 'localhost' || hostname === '127.0.0.1') {
        // If specific env var missing but we look like we're in dev/local, default to localhost
        // But for production build, we want the real server.
        // Let's check imports.meta.env.PROD
        if (import.meta.env.PROD) {
            return 'https://virtual-focus-room.onrender.com';
        }
        return 'http://localhost:3000';
    }

    // 3. Fallback for web network testing
    return `http://${hostname}:3000`;
};

export function SocketProvider({ children }) {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        const socketUrl = getSocketUrl();
        console.log('Connecting to socket server:', socketUrl);

        const socketInstance = io(socketUrl, {
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        socketInstance.on('connect', () => {
            console.log('Connected to server:', socketInstance.id);
            setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
            console.log('Disconnected from server');
            setIsConnected(false);
        });

        socketInstance.on('rooms:list', (roomList) => {
            setRooms(roomList);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    const value = {
        socket,
        isConnected,
        rooms
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
}
