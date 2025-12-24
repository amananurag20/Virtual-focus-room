import axios from '@/utils/axios';

export const getDashboardData = async () => {
    try {
        const res = await axios.get('/stats/dashboard');
        return res.data;
    } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        return { success: false };
    }
};

export const getMessages = async (roomId = null, limit = 50) => {
    try {
        const params = { limit };
        if (roomId) params.roomId = roomId;
        const res = await axios.get('/messages', { params });
        return res.data;
    } catch (error) {
        console.error('Failed to fetch messages:', error);
        return { success: false };
    }
};

export const saveMessage = async (messageData, mediaFile = null) => {
    try {
        const formData = new FormData();
        formData.append('roomId', messageData.roomId);
        formData.append('content', messageData.content);
        if (messageData.sessionId) formData.append('sessionId', messageData.sessionId);
        if (mediaFile) formData.append('media', mediaFile);

        const res = await axios.post('/messages', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data;
    } catch (error) {
        console.error('Failed to save message:', error);
        return { success: false };
    }
};
