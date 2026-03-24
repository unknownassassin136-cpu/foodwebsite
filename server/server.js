const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const socketAuth = require('./socket/auth');
const registerHandlers = require('./socket/handlers');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ─── Global Middleware ─────────────────────────────────────────
app.use(cors({
    origin: process.env.CLIENT_URL ? [process.env.CLIENT_URL, 'http://localhost:5173', 'https://foodwebsite-inky.vercel.app'] : ['http://localhost:5173', 'https://foodwebsite-inky.vercel.app'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── HTTP Server + Socket.io ───────────────────────────────────
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL ? [process.env.CLIENT_URL, 'http://localhost:5173', 'https://foodwebsite-inky.vercel.app'] : ['http://localhost:5173', 'https://foodwebsite-inky.vercel.app'],
        credentials: true
    }
});

// Make io accessible in routes via req.app.get('io')
app.set('io', io);

// Socket.io authentication and event handlers
io.use(socketAuth);
io.on('connection', (socket) => {
    registerHandlers(io, socket);
});

// ─── API Routes ────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/chat', require('./routes/chat'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Error Handler ─────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
    console.log(`🔌 Socket.io ready`);
});
