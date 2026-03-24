import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }) {
    const { user } = useAuth();
    const socketRef = useRef(null);
    const [connected, setConnected] = useState(false);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        // Only connect when user is logged in
        if (!user?.token) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setConnected(false);
            }
            return;
        }

        // Create socket connection with auth
        const socket = io(window.location.origin, {
            auth: { token: user.token },
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000
        });

        socket.on('connect', () => {
            console.log('🔌 Socket connected');
            setConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('🔌 Socket disconnected');
            setConnected(false);
        });

        socket.on('connect_error', (err) => {
            console.warn('Socket auth error:', err.message);
        });

        // ─── Order status updates → show notification ───
        socket.on('order:statusUpdate', (data) => {
            const id = Date.now();
            setNotifications(prev => [...prev, { id, ...data, type: 'order' }]);
            // Auto-remove after 6 seconds
            setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== id));
            }, 6000);
        });

        // ─── New order notification for admins ───
        socket.on('order:new', (data) => {
            const id = Date.now();
            setNotifications(prev => [...prev, { id, ...data, type: 'newOrder' }]);
            setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== id));
            }, 6000);
        });

        socketRef.current = socket;

        return () => {
            socket.disconnect();
            socketRef.current = null;
            setConnected(false);
        };
    }, [user?.token]);

    const dismissNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <SocketContext.Provider value={{
            socket: socketRef.current,
            connected,
            notifications,
            dismissNotification
        }}>
            {children}
        </SocketContext.Provider>
    );
}
