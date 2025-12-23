/**
 * Room Management Utilities
 */

// In-memory storage for rooms and users
const rooms = new Map();
const users = new Map();

/**
 * Get room data by ID
 */
function getRoomData(roomId) {
    const room = rooms.get(roomId);
    if (!room) return null;

    const participants = Array.from(room.participants.values()).map(user => ({
        socketId: user.socketId,
        username: user.username,
        isAudioOn: user.isAudioOn,
        isVideoOn: user.isVideoOn
    }));

    return {
        id: roomId,
        name: room.name,
        participants,
        createdAt: room.createdAt
    };
}

/**
 * Get all active rooms list
 */
function getAllRooms() {
    const roomList = [];
    rooms.forEach((room, roomId) => {
        roomList.push({
            id: roomId,
            name: room.name,
            participantCount: room.participants.size,
            createdAt: room.createdAt
        });
    });
    return roomList;
}

/**
 * Create a new room
 */
function createRoom(roomName) {
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const room = {
        name: roomName || `Room ${roomId.slice(-4)}`,
        participants: new Map(),
        messages: [],
        createdAt: new Date().toISOString()
    };

    rooms.set(roomId, room);
    return { roomId, room };
}

/**
 * Add user to room
 */
function addUserToRoom(roomId, socketId, username) {
    const room = rooms.get(roomId);
    if (!room) return null;

    const userData = {
        socketId,
        username: username || `User_${socketId.slice(-4)}`,
        roomId,
        isAudioOn: true,
        isVideoOn: true
    };

    room.participants.set(socketId, userData);
    users.set(socketId, userData);

    return userData;
}

/**
 * Remove user from room
 */
function removeUserFromRoom(socketId) {
    const user = users.get(socketId);
    if (!user) return null;

    const room = rooms.get(user.roomId);
    if (room) {
        room.participants.delete(socketId);

        // Delete room if empty
        if (room.participants.size === 0) {
            rooms.delete(user.roomId);
            console.log(`Room deleted: ${user.roomId} (empty)`);
        }
    }

    users.delete(socketId);
    return user;
}

/**
 * Get user by socket ID
 */
function getUser(socketId) {
    return users.get(socketId);
}

/**
 * Get room by ID
 */
function getRoom(roomId) {
    return rooms.get(roomId);
}

/**
 * Update user media state
 */
function updateUserMedia(socketId, type, enabled) {
    const user = users.get(socketId);
    if (!user) return null;

    if (type === "audio") {
        user.isAudioOn = enabled;
    } else if (type === "video") {
        user.isVideoOn = enabled;
    }

    return user;
}

/**
 * Add message to room
 */
function addMessageToRoom(roomId, message) {
    const room = rooms.get(roomId);
    if (!room) return null;

    room.messages.push(message);

    // Keep only last 100 messages
    if (room.messages.length > 100) {
        room.messages = room.messages.slice(-100);
    }

    return message;
}

module.exports = {
    rooms,
    users,
    getRoomData,
    getAllRooms,
    createRoom,
    addUserToRoom,
    removeUserFromRoom,
    getUser,
    getRoom,
    updateUserMedia,
    addMessageToRoom
};
