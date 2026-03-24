import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import api from '../api/axios';

export default function AdminChatInbox() {
    const { socket, connected } = useSocket() || {};
    const [conversations, setConversations] = useState([]);
    const [activeConv, setActiveConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(null);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const typingTimeout = useRef(null);

    // Load conversations list
    useEffect(() => {
        api.get('/chat/conversations')
            .then(res => {
                setConversations(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load conversations:', err);
                setLoading(false);
            });
    }, []);

    // Join active conversation and listen for messages
    useEffect(() => {
        if (!socket || !connected || !activeConv) return;

        socket.emit('chat:join', { conversationId: activeConv });

        const handleHistory = (data) => {
            if (data.conversationId === activeConv) {
                setMessages(data.messages);
            }
        };

        const handleMessage = (data) => {
            if (data.conversationId === activeConv) {
                setMessages(prev => [...prev, data.message]);
            }
            // Update conversation list with latest message
            setConversations(prev => {
                const updated = prev.map(c => {
                    if (c._id === data.conversationId) {
                        return { ...c, lastMessage: data.message, unreadCount: data.message.senderRole === 'user' && data.conversationId !== activeConv ? (c.unreadCount || 0) + 1 : 0 };
                    }
                    return c;
                });
                // If conversation doesn't exist yet, add it
                if (!updated.find(c => c._id === data.conversationId)) {
                    updated.unshift({
                        _id: data.conversationId,
                        lastMessage: data.message,
                        unreadCount: 1,
                        messageCount: 1
                    });
                }
                return updated;
            });
        };

        const handleTyping = (data) => {
            if (data.conversationId === activeConv && data.userRole === 'user') {
                setTyping(data.userName);
                clearTimeout(typingTimeout.current);
                typingTimeout.current = setTimeout(() => setTyping(null), 2000);
            }
        };

        // Also listen for new conversations from users
        const handleNewConv = (data) => {
            setConversations(prev => {
                const exists = prev.find(c => c._id === data.conversationId);
                if (exists) {
                    return prev.map(c => c._id === data.conversationId
                        ? { ...c, lastMessage: data.lastMessage, unreadCount: (c.unreadCount || 0) + 1 }
                        : c);
                }
                return [{ _id: data.conversationId, lastMessage: data.lastMessage, unreadCount: 1, messageCount: 1 }, ...prev];
            });
        };

        socket.on('chat:history', handleHistory);
        socket.on('chat:message', handleMessage);
        socket.on('chat:typing', handleTyping);
        socket.on('chat:newConversation', handleNewConv);

        return () => {
            socket.off('chat:history', handleHistory);
            socket.off('chat:message', handleMessage);
            socket.off('chat:typing', handleTyping);
            socket.off('chat:newConversation', handleNewConv);
        };
    }, [socket, connected, activeConv]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim() || !socket || !activeConv) return;
        socket.emit('chat:send', { conversationId: activeConv, text: input.trim() });
        setInput('');
    };

    const handleInputChange = (e) => {
        setInput(e.target.value);
        if (socket && activeConv) socket.emit('chat:typing', { conversationId: activeConv });
    };

    const selectConversation = (convId) => {
        setActiveConv(convId);
        setMessages([]);
        // Reset unread count
        setConversations(prev => prev.map(c => c._id === convId ? { ...c, unreadCount: 0 } : c));
    };

    if (loading) return <div className="spinner-container"><div className="spinner"></div></div>;

    return (
        <div className="admin-chat-layout">
            {/* Conversation List */}
            <div className="admin-chat-list">
                <h3 style={{ padding: 'var(--space-md)', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                    💬 Conversations ({conversations.length})
                </h3>
                {conversations.length === 0 ? (
                    <div style={{ padding: 'var(--space-lg)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                        No conversations yet
                    </div>
                ) : (
                    conversations.map(conv => (
                        <div
                            key={conv._id}
                            className={`admin-chat-item ${activeConv === conv._id ? 'active' : ''}`}
                            onClick={() => selectConversation(conv._id)}
                        >
                            <div className="admin-chat-item-avatar">
                                {conv.lastMessage?.senderName?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div className="admin-chat-item-info">
                                <div className="admin-chat-item-name">
                                    {conv.lastMessage?.senderName || 'Customer'}
                                    {conv.unreadCount > 0 && <span className="admin-chat-unread">{conv.unreadCount}</span>}
                                </div>
                                <div className="admin-chat-item-preview">
                                    {conv.lastMessage?.text?.slice(0, 40)}{conv.lastMessage?.text?.length > 40 ? '…' : ''}
                                </div>
                            </div>
                            <div className="admin-chat-item-time">
                                {conv.lastMessage?.createdAt
                                    ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                    : ''}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Active Chat */}
            <div className="admin-chat-main">
                {!activeConv ? (
                    <div className="admin-chat-empty">
                        <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>💬</div>
                        <h3>Select a conversation</h3>
                        <p>Choose a customer conversation from the list to start chatting</p>
                    </div>
                ) : (
                    <>
                        <div className="admin-chat-messages">
                            {messages.map((msg, i) => (
                                <div key={msg._id || i} className={`chat-msg ${msg.senderRole === 'admin' ? 'chat-msg-self' : 'chat-msg-other'}`}>
                                    <div className="chat-msg-bubble">
                                        {msg.senderRole === 'user' && <div className="chat-msg-name">{msg.senderName}</div>}
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

                        <form className="admin-chat-input" onSubmit={handleSend}>
                            <input
                                type="text"
                                value={input}
                                onChange={handleInputChange}
                                placeholder="Reply to customer..."
                                maxLength={1000}
                            />
                            <button type="submit" disabled={!input.trim() || !connected}>
                                Send ➤
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
