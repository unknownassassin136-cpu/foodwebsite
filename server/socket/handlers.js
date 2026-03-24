const Message = require('../models/Message');

/**
 * Register all Socket.io event handlers.
 * Called once per connected socket.
 *
 * Room naming conventions:
 *   - user:<userId>          — private room for order notifications
 *   - admin                  — all admin users
 *   - chat:<conversationId>  — chat conversation room
 */
const registerHandlers = (io, socket) => {
    const { userId, userName, userRole } = socket;

    console.log(`🔌 Socket connected: ${userName} (${userRole}) [${socket.id}]`);

    // ─── Auto-join rooms ─────────────────────────────────────
    // Every user joins their personal room for order notifications
    socket.join(`user:${userId}`);

    // Admins join the admin room for new-order alerts
    if (userRole === 'admin') {
        socket.join('admin');
        console.log(`   → ${userName} joined admin room`);
    }

    // ─── Order Events ────────────────────────────────────────
    /**
     * order:join — User subscribes to updates for a specific order
     * Data: { orderId }
     */
    socket.on('order:join', ({ orderId }) => {
        if (orderId) {
            socket.join(`order:${orderId}`);
        }
    });

    // ─── Chat Events ─────────────────────────────────────────
    /**
     * chat:join — Join a conversation room and receive history
     * Data: { conversationId }
     */
    socket.on('chat:join', async ({ conversationId }) => {
        if (!conversationId) return;

        socket.join(`chat:${conversationId}`);

        // Send chat history (last 50 messages)
        try {
            const messages = await Message.find({ conversationId })
                .sort({ createdAt: 1 })
                .limit(50)
                .lean();

            socket.emit('chat:history', { conversationId, messages });

            // Mark messages as read if admin is joining
            if (userRole === 'admin') {
                await Message.updateMany(
                    { conversationId, senderRole: 'user', read: false },
                    { read: true }
                );
            }
        } catch (error) {
            console.error('chat:join error:', error.message);
        }
    });

    /**
     * chat:send — Send a message in a conversation
     * Data: { conversationId, text, orderId? }
     */
    socket.on('chat:send', async ({ conversationId, text, orderId }) => {
        if (!conversationId || !text?.trim()) return;

        // Sanitize text (basic XSS prevention)
        const sanitized = text.trim().slice(0, 1000)
            .replace(/</g, '&lt;').replace(/>/g, '&gt;');

        try {
            const message = await Message.create({
                conversationId,
                sender: userId,
                senderName: userName,
                senderRole: userRole,
                orderId: orderId || null,
                text: sanitized
            });

            const messageData = message.toObject();

            // Broadcast to everyone in the conversation room
            io.to(`chat:${conversationId}`).emit('chat:message', {
                conversationId,
                message: messageData
            });

            // If a customer sent the message, notify admins about new message
            if (userRole === 'user') {
                io.to('admin').emit('chat:newConversation', {
                    conversationId,
                    lastMessage: messageData,
                    userName
                });
            }
        } catch (error) {
            console.error('chat:send error:', error.message);
            socket.emit('chat:error', { message: 'Failed to send message' });
        }
    });

    /**
     * chat:typing — Typing indicator
     * Data: { conversationId }
     */
    socket.on('chat:typing', ({ conversationId }) => {
        if (!conversationId) return;
        socket.to(`chat:${conversationId}`).emit('chat:typing', {
            conversationId,
            userName,
            userRole
        });
    });

    // ─── Disconnect ──────────────────────────────────────────
    socket.on('disconnect', (reason) => {
        console.log(`🔌 Socket disconnected: ${userName} (${reason})`);
    });
};

module.exports = registerHandlers;
