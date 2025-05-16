import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, MailOpen } from "lucide-react";
import { getNotifications, markNotificationAsRead, connectWebSocket } from '../../../api/Notification';
import { Pagination } from 'antd';
import './notification.scss';

// Hàm tạo ID duy nhất
const generateUniqueId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Hàm lấy userId từ token
const getUserIdFromToken = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.user_id;
    } catch (error) {
        console.error('Error decoding token:', error);
        return '123'; // Fallback
    }
};

// Hàm chuyển đổi dữ liệu từ backend
const mapNotification = (notification) => {
    console.log('Mapping notification:', notification);
    return {
        id: notification.id || generateUniqueId(),
        backendId: notification.id, // Lưu ID từ backend
        title: notification.title || 'No Title',
        description: notification.message || 'No Content',
        date: notification.createdAt || new Date().toISOString(),
        isRead: notification.isRead || false
    };
};

// Hàm định dạng thời gian
function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    if (diffInSeconds < 60) return `${diffInSeconds} giây trước`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    return `${Math.floor(diffInHours / 24)} ngày trước`;
}

const Notification = () => {
    const [notifications, setNotifications] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10; // Giới hạn 10 thông báo mỗi trang
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    // Lấy danh sách thông báo khi component mount
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                if (!token) {
                    throw new Error('No token found');
                }
                console.log('Fetching notifications with token:', token.substring(0, 20) + '...');
                const data = await getNotifications(token);
                console.log('API Notifications:', data);
                const mappedData = data.map(mapNotification);
                const sortedData = mappedData.sort((a, b) => {
                    const idA = typeof a.id === 'string' && !isNaN(a.id) ? parseInt(a.id) : a.id;
                    const idB = typeof b.id === 'string' && !isNaN(b.id) ? parseInt(b.id) : b.id;
                    return idB - idA;
                });
                setNotifications(sortedData);
            } catch (error) {
                console.error('Error fetching notifications:', error);
                setError('Không thể lấy thông báo. Vui lòng đăng nhập lại.');
            }
        };
        if (token) {
            fetchNotifications();
        }
    }, [token]);

    // Tích hợp WebSocket để nhận thông báo thời gian thực
    useEffect(() => {
        if (!token) return;
        const userId = getUserIdFromToken(token);
        console.log('Connecting WebSocket for userId:', userId);
        const ws = connectWebSocket(userId, (notification) => {
            console.log('WebSocket Notification:', notification);
            const newNotification = mapNotification({
                id: notification.id || generateUniqueId(),
                title: notification.title,
                message: notification.message,
                type: notification.type,
                isActive: true,
                isRead: false,
                createdAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            });
            setNotifications((prev) => [newNotification, ...prev]);
        });
        return () => {
            console.log('Closing WebSocket');
            ws.close();
        };
    }, [token]);

    // Hàm đánh dấu thông báo đã đọc
    const handleMarkAsRead = async (notificationId) => {
        try {
            console.log('Attempting to mark notification as read, ID:', notificationId);
            await markNotificationAsRead(notificationId, token);
            setNotifications((prev) => {
                const updatedNotifications = prev.map((n) =>
                    n.backendId === notificationId ? { ...n, isRead: true } : n
                );
                console.log('Updated Notifications:', updatedNotifications);
                return updatedNotifications;
            });
        } catch (error) {
            console.error('Error marking notification as read:', error.response?.data || error.message);
            if (error.response?.status === 401) {
                setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
                navigate('/login');
            } else {
                setError(error.response?.data?.message || 'Không thể đánh dấu thông báo đã đọc.');
            }
        }
    };

    // Hàm xử lý khi click vào thông báo
    const handleNotificationClick = (notification) => {
        console.log('Notification clicked:', notification);
        if (!notification.isRead && notification.backendId) {
            handleMarkAsRead(notification.backendId);
        } else {
            console.log('Notification already read or invalid ID:', notification.id);
        }
    };

    // Tính toán thông báo hiển thị trên trang hiện tại
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const displayedNotifications = notifications.slice(startIndex, endIndex);

    return (
        <div className="container-account">
            <div className="notices-list">
                {error ? (
                    <p className="error-message">{error}</p>
                ) : notifications.length === 0 ? (
                    <p className="no-notifications">Không có thông báo nào.</p>
                ) : (
                    <>
                        {displayedNotifications.map((notice) => (
                            <div
                                className={`account-notice ${notice.isRead ? 'read' : 'unread'}`}
                                key={notice.id}
                                onClick={() => handleNotificationClick(notice)}
                            >
                                <div className="tittle-account-notice">
                                    <span>{notice.title}</span>
                                    <span>{timeAgo(notice.date)}</span>
                                </div>
                                <div className="main-account-notice">
                                    <div className="relative">
                                        {notice.isRead ? (
                                            <MailOpen size={20} className="text-gray-500" />
                                        ) : (
                                            <>
                                                <Mail size={20} className="text-blue-500" />
                                                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                                            </>
                                        )}
                                    </div>
                                    <span>{notice.description}</span>
                                </div>
                            </div>
                        ))}
                        <Pagination
                            current={currentPage}
                            pageSize={pageSize}
                            total={notifications.length}
                            onChange={(page) => setCurrentPage(page)}
                            style={{ marginTop: 16, textAlign: 'center' }}
                            showSizeChanger={false}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default Notification;