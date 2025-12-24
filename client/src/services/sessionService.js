import axios from '@/utils/axios';

export const recordSession = async (roomId, event, sessionId = null, roomName = null) => {
    try {
        const res = await axios.post('/stats/session', { roomId, roomName, event, sessionId });
        return res.data;
    } catch (error) {
        console.error('Failed to record session:', error);
        return { success: false };
    }
};
