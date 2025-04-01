const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const winston = require('winston');
const adminMetrics = require('./api/admin-metrics');

// Configure logging
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/server.log' })
    ]
});

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/admin-metrics', adminMetrics);

// Socket.IO Signaling Server
const rooms = new Map();

io.on('connection', (socket) => {
    logger.info(`New connection: ${socket.id}`);

    socket.on('join', (roomId, userId) => {
        logger.info(`User ${userId} joining room ${roomId}`);
        
        // Add user to room
        socket.join(roomId);
        if (!rooms.has(roomId)) {
            rooms.set(roomId, new Set());
        }
        rooms.get(roomId).add(userId);

        // Notify others in room
        socket.to(roomId).emit('user-connected', userId);
        
        // Send list of existing users
        socket.emit('users-in-room', Array.from(rooms.get(roomId)));
    });

    socket.on('offer', (roomId, offer) => {
        socket.to(roomId).emit('offer', offer);
    });

    socket.on('answer', (roomId, answer) => {
        socket.to(roomId).emit('answer', answer);
    });

    socket.on('candidate', (roomId, candidate) => {
        socket.to(roomId).emit('candidate', candidate);
    });

    socket.on('disconnect', () => {
        logger.info(`User disconnected: ${socket.id}`);
        // Clean up room participants
        rooms.forEach((users, roomId) => {
            if (users.delete(socket.id)) {
                io.to(roomId).emit('user-disconnected', socket.id);
                if (users.size === 0) {
                    rooms.delete(roomId);
                }
            }
        });
    });
});

// Serve React/Vue frontend if in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'client', 'build')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
    });
}

// Error handling
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start server
server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Video call available at: http://localhost:${PORT}/callroom.html`);
});
