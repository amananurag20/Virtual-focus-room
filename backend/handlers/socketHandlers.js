/**
 * Socket Event Handlers
 */

const roomManager = require("../utils/roomManager");

/**
 * Setup all socket event handlers
 */
function setupSocketHandlers(io, socket) {
    console.log(`User connected: ${socket.id}`);

    // Send current rooms list on connect
    socket.emit("rooms:list", roomManager.getAllRooms());

    // Room events
    socket.on("room:create", (data, callback) => handleRoomCreate(io, socket, data, callback));
    socket.on("room:join", (data, callback) => handleRoomJoin(io, socket, data, callback));
    socket.on("room:leave", () => handleRoomLeave(io, socket));

    // WebRTC signaling events
    socket.on("webrtc:offer", (data) => handleWebRTCOffer(socket, data));
    socket.on("webrtc:answer", (data) => handleWebRTCAnswer(socket, data));
    socket.on("webrtc:ice-candidate", (data) => handleICECandidate(socket, data));

    // Media events
    socket.on("media:toggle", (data) => handleMediaToggle(socket, data));

    // Chat events
    socket.on("chat:message", (data) => handleChatMessage(io, socket, data));

    // User interaction events
    socket.on("user:ping", (data) => handleUserPing(socket, data));
    socket.on("request:send", (data) => handleRequestSend(socket, data));
    socket.on("request:respond", (data) => handleRequestRespond(socket, data));

    // Disconnect
    socket.on("disconnect", () => handleDisconnect(io, socket));
}

/**
 * Handle room creation
 */
function handleRoomCreate(io, socket, { roomName, username }, callback) {
    const { roomId, room } = roomManager.createRoom(roomName || `${username}'s Room`);

    // Add creator to room
    const userData = roomManager.addUserToRoom(roomId, socket.id, username);
    socket.join(roomId);

    console.log(`Room created: ${roomId} by ${userData.username}`);

    // Notify all clients about new room
    io.emit("rooms:list", roomManager.getAllRooms());

    callback({
        success: true,
        roomId,
        room: roomManager.getRoomData(roomId)
    });
}

/**
 * Handle room joining
 */
function handleRoomJoin(io, socket, { roomId, username }, callback) {
    const room = roomManager.getRoom(roomId);

    if (!room) {
        callback({ success: false, error: "Room not found" });
        return;
    }

    // Get existing users before joining
    const existingUsers = Array.from(room.participants.entries())
        .map(([id, user]) => ({ socketId: id, username: user.username }));

    // Add user to room
    const userData = roomManager.addUserToRoom(roomId, socket.id, username);
    socket.join(roomId);

    console.log(`${userData.username} joined room: ${roomId}`);

    // Notify others in room about new user
    socket.to(roomId).emit("user:joined", {
        socketId: socket.id,
        username: userData.username
    });

    // Update rooms list for all
    io.emit("rooms:list", roomManager.getAllRooms());

    callback({
        success: true,
        room: roomManager.getRoomData(roomId),
        existingUsers
    });
}

/**
 * Handle room leaving
 */
function handleRoomLeave(io, socket) {
    const user = roomManager.getUser(socket.id);
    if (!user) return;

    const roomId = user.roomId;
    socket.to(roomId).emit("user:left", { socketId: socket.id });
    socket.leave(roomId);

    roomManager.removeUserFromRoom(socket.id);
    io.emit("rooms:list", roomManager.getAllRooms());
}

/**
 * Handle WebRTC offer
 */
function handleWebRTCOffer(socket, { to, offer }) {
    const user = roomManager.getUser(socket.id);
    socket.to(to).emit("webrtc:offer", {
        from: socket.id,
        username: user?.username,
        offer
    });
}

/**
 * Handle WebRTC answer
 */
function handleWebRTCAnswer(socket, { to, answer }) {
    socket.to(to).emit("webrtc:answer", {
        from: socket.id,
        answer
    });
}

/**
 * Handle ICE candidate
 */
function handleICECandidate(socket, { to, candidate }) {
    socket.to(to).emit("webrtc:ice-candidate", {
        from: socket.id,
        candidate
    });
}

/**
 * Handle media toggle
 */
function handleMediaToggle(socket, { type, enabled }) {
    const user = roomManager.updateUserMedia(socket.id, type, enabled);
    if (!user) return;

    socket.to(user.roomId).emit("user:media-toggle", {
        socketId: socket.id,
        type,
        enabled
    });
}

/**
 * Handle chat message
 */
function handleChatMessage(io, socket, { message }) {
    const user = roomManager.getUser(socket.id);
    if (!user) return;

    const chatMessage = {
        id: `msg_${Date.now()}`,
        socketId: socket.id,
        username: user.username,
        message,
        timestamp: new Date().toISOString()
    };

    roomManager.addMessageToRoom(user.roomId, chatMessage);
    io.to(user.roomId).emit("chat:message", chatMessage);
}

/**
 * Handle user ping
 */
function handleUserPing(socket, { targetSocketId }) {
    const user = roomManager.getUser(socket.id);
    if (!user) return;

    socket.to(targetSocketId).emit("user:pinged", {
        from: socket.id,
        username: user.username
    });
}

/**
 * Handle connection request
 */
function handleRequestSend(socket, { targetSocketId, message }) {
    const user = roomManager.getUser(socket.id);
    if (!user) return;

    socket.to(targetSocketId).emit("request:received", {
        from: socket.id,
        username: user.username,
        message
    });
}

/**
 * Handle request response
 */
function handleRequestRespond(socket, { targetSocketId, accepted }) {
    const user = roomManager.getUser(socket.id);
    if (!user) return;

    socket.to(targetSocketId).emit("request:response", {
        from: socket.id,
        username: user.username,
        accepted
    });
}

/**
 * Handle disconnect
 */
function handleDisconnect(io, socket) {
    console.log(`User disconnected: ${socket.id}`);

    const user = roomManager.getUser(socket.id);
    if (user) {
        socket.to(user.roomId).emit("user:left", { socketId: socket.id });
        roomManager.removeUserFromRoom(socket.id);
        io.emit("rooms:list", roomManager.getAllRooms());
    }
}

module.exports = { setupSocketHandlers };
