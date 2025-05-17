import axios from 'axios';

// Địa chỉ base URL của backend
const API_URL = 'http://localhost:8080';

// Tạo instance của axios với cấu hình mặc định
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Hàm lấy danh sách thông báo cho người dùng
export const getNotifications = async (token) => {
    try {
        if (!token) {
            throw new Error('Token is missing');
        }
        console.log('Fetching notifications with token:', token.substring(0, 20) + '...');
        const response = await api.get('/notifications/history', {
            headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Notifications response:', response.data);
        return response.data.result;
    } catch (error) {
        console.error('Error fetching notifications:', error.response?.data || error.message);
        throw error;
    }
};

// Hàm lấy toàn bộ thông báo đang hoạt động (cho admin)
export const getAllNotifications = async (token) => {
    try {
        if (!token) {
            throw new Error('Token is missing');
        }
        console.log('Fetching all notifications with token:', token.substring(0, 20) + '...');
        const response = await api.get('/notifications/all', {
            headers: { Authorization: `Bearer ${token}` },
        });
        console.log('All notifications response:', response.data);
        return response.data.result;
    } catch (error) {
        console.error('Error fetching all notifications:', error.response?.data || error.message);
        throw error;
    }
};

// Hàm lấy danh sách thông báo giảm giá (không cần token)
export const getDiscountNotifications = async () => {
    try {
        console.log('Fetching discount notifications');
        const response = await api.get('/notifications/discounts');
        console.log('Discount notifications response:', response.data);
        return response.data.result;
    } catch (error) {
        console.error('Error fetching discount notifications:', error.response?.data || error.message);
        throw error;
    }
};

// Hàm đánh dấu thông báo đã đọc
export const markNotificationAsRead = async (notificationId, token) => {
    try {
        if (!token) {
            throw new Error('Token is missing');
        }
        console.log('Marking notification as read, ID:', notificationId);
        const response = await api.post(`/notifications/${notificationId}/read`, {}, {
            headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Mark as read response:', response.data);
        return response.data.result;
    } catch (error) {
        console.error('Error marking notification as read:', error.response?.data || error.message);
        throw error;
    }
};

// Hàm tạo thông báo giảm giá (dùng body JSON, chỉ dành cho ADMIN)
export const createDiscountNotification = async (notificationData, token) => {
    try {
        if (!token) {
            throw new Error('Token is missing');
        }
        console.log('Creating discount notification:', notificationData);
        const response = await api.post('/notifications/create-discount', notificationData, {
            headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Create discount response:', response.data);
        return response.data.result;
    } catch (error) {
        console.error('Error creating discount notification:', error.response?.data || error.message);
        throw error;
    }
};

// Hàm kết nối WebSocket để nhận thông báo thời gian thực
export const connectWebSocket = (userId, onMessage) => {
    console.log('Connecting WebSocket for userId:', userId);
    const ws = new WebSocket(`${API_URL.replace('http', 'ws')}/ws/notifications?userId=${userId}`);
    ws.onmessage = (event) => {
        try {
            const notification = JSON.parse(event.data);
            console.log('Received WebSocket notification:', notification);
            onMessage(notification);
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    };
    ws.onopen = () => console.log('WebSocket connected');
    ws.onclose = () => {
        console.log('WebSocket disconnected, attempting to reconnect...');
        setTimeout(() => connectWebSocket(userId, onMessage), 5000); // Thử lại sau 5s
    };
    ws.onerror = (error) => console.error('WebSocket error:', error);
    return ws;
};

export default api;