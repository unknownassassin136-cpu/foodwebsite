import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

export default function ChatWidget() {
    const { socket, connected } = useSocket() || {};
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(null);
    const [unread, setUnread] = useState(0);
    const messagesEndRef = useRef(null);
    const typingTimeout = useRef(null);

    // Conversation ID = user's own ID (1 conversation per customer)
    const conversationId = user?._id;
    const shouldShow = user && user.role !== 'admin';

    useEffect(() => {
        if (!shouldShow || !socket || !connected || !conversationId) return;

        socket.emit('chat:join', { conversationId });

        const handleHistory = (data) => {
            if (data.conversationId === conversationId) {
                setMessages(data.messages);
            }
        };

        const handleMessage = (data) => {
            if (data.conversationId === conversationId) {
                setMessages(prev => [...prev, data.message]);
                if (!open && data.message.senderRole === 'admin') {
                    setUnread(prev => prev + 1);
                }
            }
        };

        const handleTyping = (data) => {
            if (data.conversationId === conversationId && data.userRole === 'admin') {
                setTyping(data.userName);
                clearTimeout(typingTimeout.current);
                typingTimeout.current = setTimeout(() => setTyping(null), 2000);
            }
        };

        socket.on('chat:history', handleHistory);
        socket.on('chat:message', handleMessage);
        socket.on('chat:typing', handleTyping);

        return () => {
            socket.off('chat:history', handleHistory);
            socket.off('chat:message', handleMessage);
            socket.off('chat:typing', handleTyping);
        };
    }, [shouldShow, socket, connected, conversationId, open]);

    useEffect(() => {
        if (open) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, open]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim() || !socket) return;
        socket.emit('chat:send', { conversationId, text: input.trim() });
        setInput('');
    };

    const handleInputChange = (e) => {
        setInput(e.target.value);
        if (socket) socket.emit('chat:typing', { conversationId });
    };

    const toggleOpen = () => {
        setOpen(!open);
        if (!open) setUnread(0);
    };

    // Don't render for admins or unauthenticated users
    if (!shouldShow) return null;

    return (
        <>
            <button className="chat-bubble" onClick={toggleOpen}>
                💬
                {unread > 0 && <span className="chat-bubble-badge">{unread}</span>}
            </button>

            {open && (
                <div className="chat-panel">
                    <div className="chat-panel-header">
                        <div>
                            <strong>Support Chat</strong>
                            <span className={`chat-status ${connected ? 'online' : 'offline'}`}>
                                {connected ? '● Online' : '○ Offline'}
                            </span>
                        </div>
                        <button className="chat-panel-close" onClick={() => setOpen(false)}>✕</button>
                    </div>

                    <div className="chat-messages">
                        {messages.length === 0 && (
                            <div className="chat-empty">
                                <p>👋 Hi! Need help with your order?</p>
                                <p>Send us a message and our team will respond.</p>
                            </div>
                        )}
                        {messages.map((msg, i) => (
                            <div key={msg._id || i} className={`chat-msg ${msg.senderRole === 'user' ? 'chat-msg-self' : 'chat-msg-other'}`}>
                                <div className="chat-msg-bubble">
                                    {msg.senderRole === 'admin' && <div className="chat-msg-name">{msg.senderName}</div>}
                                    <p>{msg.text}</p>
                                    <span className="chat-msg-time">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {typing && (
                            <div className="chat-msg chat-msg-other">
                                <div className="chat-msg-bubble chat-typing">
                                    <span className="typing-dots"><span></span><span></span><span></span></span>
                                    {typing} is typing…
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="chat-input-area" onSubmit={handleSend}>
                        <input
                            type="text"
                            value={input}
                            onChange={handleInputChange}
                            placeholder="Type a message..."
                            maxLength={1000}
                        />
                        <button type="submit" disabled={!input.trim() || !connected}>➤</button>
                    </form>
                </div>
            )}
        </>
    );
}
