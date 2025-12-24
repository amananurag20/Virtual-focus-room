import axios from '@/utils/axios';

export const recordSession = async (roomId, event, sessionId = null) => {
    try {
        const res = await axios.post('/stats/session', { roomId, event, sessionId });
        return res.data;
    } catch (error) {
        console.error('Failed to record session:', error);
        return { success: false };
    }
};
