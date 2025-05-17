import { useState, useEffect } from "react";
import { X, Mail, MailOpen } from "lucide-react";
import { getNotifications, markNotificationAsRead, connectWebSocket } from '../../api/Notification';

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

// Tabs cho nhân viên
const tabs = ["Tất cả", "Phân công", "Khuyến mãi"];

// Hàm chuyển đổi type từ backend sang tab
const mapTypeToTab = (type) => {
    switch (type) {
        case "ASSIGNMENT": return "Phân công";
        case "PROMOTION": return "Khuyến mãi";
        default: return "Tất cả";
    }
};

// Hàm chuyển đổi dữ liệu từ backend
const mapNotification = (notification) => {
    if (!notification.id || !notification.title || !notification.createdAt || !notification.message) {
        console.warn('Invalid notification data:', notification);
    }
    return {
        id: notification.id || generateUniqueId(),
        title: notification.title || 'Không có tiêu đề',
        date: notification.createdAt || new Date().toISOString(),
        content: notification.message || 'Không có nội dung',
        sender: "Hệ thống",
        status: notification.isRead ? "Đã đọc" : "Chưa đọc",
        type: mapTypeToTab(notification.type),
        assignedTo: notification.assignedTo || null
    };
};

// Hàm tính thời gian trước
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

export default function EmployeeNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [activeTab, setActiveTab] = useState("Tất cả");
    const [error, setError] = useState(null);
    const token = localStorage.getItem('token');

    // Lấy danh sách thông báo khi component mount
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                if (!token) {
                    throw new Error('No token found');
                }
                const userId = getUserIdFromToken(token);
                console.log('Fetching notifications for staff, userId:', userId);
                const data = await getNotifications(token);
                console.log('API Notifications:', data);
                console.log('AssignedTo values:', data.map(n => n.assignedTo));
                // Lọc thông báo được phân công cho nhân viên hoặc không có assignedTo
                const assignedNotifications = data.filter(n => n.assignedTo === userId || n.assignedTo === undefined);
                const mappedData = assignedNotifications.map(mapNotification);
                // Sắp xếp theo id giảm dần
                const sortedData = mappedData.sort((a, b) => {
                    const idA = typeof a.id === 'string' && !isNaN(a.id) ? parseInt(a.id) : a.id;
                    const idB = typeof b.id === 'string' && !isNaN(b.id) ? parseInt(b.id) : b.id;
                    return idB - idA;
                });
                console.log('Sorted Notifications:', sortedData);
                setNotifications(sortedData);
            } catch (error) {
                console.error('Error fetching notifications:', error);
                setError('Không thể lấy thông báo. Vui lòng đăng nhập lại.');
            }
        };
        if (token) {
            fetchNotifications();
        } else {
            window.location.href = '/login';
        }
    }, [token]);

    // Tích hợp WebSocket để nhận thông báo thời gian thực
    useEffect(() => {
        if (!token) return;
        const userId = getUserIdFromToken(token);
        const ws = connectWebSocket(userId, (notification) => {
            console.log('WebSocket Notification:', notification);
            console.log('WebSocket Notification assignedTo:', notification.assignedTo);
            // Thêm thông báo nếu được phân công cho nhân viên hoặc không có assignedTo
            if (notification.assignedTo === userId || notification.assignedTo === undefined) {
                const newNotification = mapNotification({
                    id: notification.id || generateUniqueId(),
                    title: notification.title,
                    message: notification.message,
                    type: notification.type,
                    isActive: true,
                    isRead: false,
                    createdAt: new Date().toISOString(),
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    assignedTo: notification.assignedTo
                });
                setNotifications((prev) => {
                    const updatedNotifications = [newNotification, ...prev];
                    console.log('Updated Notifications with WebSocket:', updatedNotifications);
                    return updatedNotifications;
                });
            }
        });
        return () => ws.close();
    }, [token]);

    // Hàm đánh dấu thông báo đã đọc
    const handleMarkAsRead = async (notificationId) => {
        try {
            console.log('Marking as read, ID:', notificationId);
            await markNotificationAsRead(notificationId, token);
            setNotifications((prev) => {
                const updatedNotifications = prev.map((n) =>
                    n.id === notificationId ? { ...n, status: "Đã đọc" } : n
                );
                console.log('Updated Notifications after read:', updatedNotifications);
                return updatedNotifications;
            });
            if (selectedNotification?.id === notificationId) {
                setSelectedNotification({ ...selectedNotification, status: "Đã đọc" });
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
            if (error.response?.status === 401) {
                setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
            } else {
                setError('Không thể đánh dấu thông báo đã đọc.');
            }
        }
    };

    // Hàm xử lý khi click vào thông báo
    const handleNotificationClick = (notification) => {
        setSelectedNotification(notification);
        if (notification.status === "Chưa đọc") {
            handleMarkAsRead(notification.id);
        }
    };

    // Lọc thông báo theo tab
    const filteredNotifications = activeTab === "Tất cả"
        ? notifications
        : notifications.filter(n => n.type === activeTab);

    console.log('Active Tab:', activeTab);
    console.log('Filtered Notifications:', filteredNotifications);

    return (
        <div className="relative flex flex-col p-6">
            {/* Hiển thị lỗi nếu có */}
            {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-4 mb-4 border-b pb-2">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        className={`px-4 py-2 rounded-md ${activeTab === tab ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Danh sách thông báo */}
            <div className="w-full border p-4 rounded-lg shadow-md max-h-[600px] overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4">Danh sách thông báo ({filteredNotifications.length})</h2>
                {filteredNotifications.length === 0 ? (
                    <p className="text-gray-500">,Không có thông báo nào.</p>
                ) : (
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-2 text-center">Trạng thái</th>
                                <th className="p-2 text-left">Tiêu đề & Ngày</th>
                                <th className="p-2 text-center">Thời gian</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredNotifications.map((notification) => (
                                <tr
                                    key={notification.id}
                                    className="text-center hover:bg-gray-50 cursor-pointer border-t border-b"
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <td className="p-2 text-center">
                                        <div className="flex justify-center items-center h-full">
                                            {notification.status === "Chưa đọc" ? (
                                                <Mail size={20} className="text-blue-500" />
                                            ) : (
                                                <MailOpen size={20} className="text-gray-500" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-2 text-left">
                                        <div className="font-medium">{notification.title}</div>
                                        <div className="text-sm text-gray-500">
                                            {new Date(notification.date).toLocaleString('vi-VN')}
                                        </div>
                                    </td>
                                    <td className="p-2 text-sm">{timeAgo(notification.date)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Hiển thị thông báo chi tiết */}
            {selectedNotification && (
                <div className="mt-4 p-4 border rounded-lg shadow-md bg-white relative">
                    <button
                        className="absolute top-2 right-2 p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                        onClick={() => setSelectedNotification(null)}
                    >
                        <X size={18} />
                    </button>
                    <h3 className="text-lg font-semibold">{selectedNotification.title}</h3>
                    <p className="text-sm text-gray-500">
                        {new Date(selectedNotification.date).toLocaleString('vi-VN')}
                    </p>
                    <p className="mt-2">{selectedNotification.content}</p>
                    <p className="mt-2 text-sm text-gray-600">Người gửi: {selectedNotification.sender}</p>
                </div>
            )}
        </div>
    );
}