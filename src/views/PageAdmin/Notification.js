import { useState, useEffect } from "react";
import { X, Mail, MailOpen, Plus } from "lucide-react";
import { getNotifications, getAllNotifications, markNotificationAsRead, connectWebSocket, createDiscountNotification } from '../../api/Notification';

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

// Hàm kiểm tra quyền admin từ token
const isAdmin = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.scope === 'ADMIN' || payload.roles?.includes('ADMIN');
    } catch (error) {
        console.error('Error decoding token:', error);
        return false;
    }
};

const tabs = ["Tất cả", "Khuyến mãi", "Nhắc nhở", "Sắp khởi hành", "Đặt tour", "Thanh toán", "Đặt cọc"];

// Hàm chuyển đổi type từ backend sang tab
const mapTypeToTab = (type) => {
    switch (type) {
        case "PROMOTION": return "Khuyến mãi";
        case "REMINDER": return "Nhắc nhở";
        case "UPCOMING_TOUR": return "Sắp khởi hành";
        case "BOOKING_SUCCESS": return "Đặt tour";
        case "PAYMENT_SUCCESS": return "Thanh toán";
        case "SUCCESS": return "Thanh toán"; // Hỗ trợ type cũ
        case "DEPOSIT_SUCCESS": return "Đặt cọc";
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
        title: notification.title || 'No Title',
        date: notification.createdAt || new Date().toISOString(),
        content: notification.message || 'No Content',
        sender: "Hệ thống",
        status: notification.isRead ? "Đã đọc" : "Chưa đọc",
        type: mapTypeToTab(notification.type)
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

export default function NotificationManagement() {
    const [notifications, setNotifications] = useState([]);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [activeTab, setActiveTab] = useState("Tất cả");
    const [error, setError] = useState(null);
    const [isAdminUser, setIsAdminUser] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        message: "",
        daysValid: 3
    });
    const token = localStorage.getItem('token');

    // Kiểm tra quyền admin khi component mount
    useEffect(() => {
        if (token) {
            setIsAdminUser(isAdmin(token));
        }
    }, [token]);

    // Lấy danh sách thông báo khi component mount
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                if (!token) {
                    throw new Error('No token found');
                }
                console.log('Fetching notifications, isAdminUser:', isAdminUser, 'activeTab:', activeTab);
                const data = await getAllNotifications(token);
                console.log('API Notifications:', data);
                const mappedData = data.map(mapNotification);
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
        }
    }, [token, isAdminUser]);

    // Tích hợp WebSocket để nhận thông báo thời gian thực
    useEffect(() => {
        if (!token) return;
        const userId = getUserIdFromToken(token);
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
            setNotifications((prev) => {
                const updatedNotifications = [newNotification, ...prev];
                console.log('Updated Notifications with WebSocket:', updatedNotifications);
                return updatedNotifications;
            });
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

    // Hàm xử lý thay đổi form
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'daysValid' ? parseInt(value) : value
        }));
    };

    // Hàm gửi thông báo mới
    const handleCreateNotification = async (e) => {
        e.preventDefault();
        try {
            await createDiscountNotification(formData, token);
            setError(null);
            setFormData({ title: "", message: "", daysValid: 3 });
            setShowForm(false);
            alert('Thông báo đã được tạo thành công!');
            console.log('Fetching notifications after create, isAdminUser:', isAdminUser, 'activeTab:', activeTab);
            const data = isAdminUser ? await getAllNotifications(token) : await getNotifications(token);
            console.log('API Notifications after create:', data);
            const mappedData = data.map(mapNotification);
            // Sắp xếp theo id giảm dần
            const sortedData = mappedData.sort((a, b) => {
                const idA = typeof a.id === 'string' && !isNaN(a.id) ? parseInt(a.id) : a.id;
                const idB = typeof b.id === 'string' && !isNaN(b.id) ? parseInt(b.id) : b.id;
                return idB - idA;
            });
            console.log('Sorted Notifications after create:', sortedData);
            setNotifications(sortedData);
        } catch (error) {
            console.error('Error creating notification:', error);
            if (error.response?.status === 401) {
                setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
            } else {
                setError('Không thể tạo thông báo.');
            }
        }
    };

    // Hàm ẩn form
    const handleCloseForm = () => {
        setShowForm(false);
        setFormData({ title: "", message: "", daysValid: 3 });
        setError(null);
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

            {/* Nút thêm thông báo cho admin */}
            {isAdminUser && (
                <div className="mb-4">
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                        <Plus size={20} className="mr-2" />
                        Thêm thông báo
                    </button>
                </div>
            )}

            {/* Form tạo thông báo (hiển thị trong modal) */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-[1000px]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Tạo thông báo giảm giá</h3>
                            <button onClick={handleCloseForm}>
                                <X size={24} className="text-gray-500 hover:text-gray-700" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateNotification}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Tiêu đề</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleFormChange}
                                    className="mt-1 block w-full p-2 border rounded-md"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Nội dung</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleFormChange}
                                    className="mt-1 block w-full p-2 border rounded-md"
                                    rows="4"
                                    required
                                ></textarea>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Số ngày hiệu lực</label>
                                <input
                                    type="number"
                                    name="daysValid"
                                    value={formData.daysValid}
                                    onChange={handleFormChange}
                                    className="mt-1 block w-full p-2 border rounded-md"
                                    min="1"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={handleCloseForm}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                >
                                    Tạo thông báo
                                </button>
                            </div>
                        </form>
                    </div>
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
                    <p className="text-gray-500">Không có thông báo nào trong tab này.</p>
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
                                    className="text-center hover:bg-gray-200 cursor-pointer border-t border-b"
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <td className="p-2 text-center">
                                        <div className="flex justify-center items-center h-full">
                                            {notification.status === "Chưa đọc" ? (
                                                <Mail size={20} />
                                            ) : (
                                                <MailOpen size={20} />
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-2 text-left">
                                        <div>{notification.title}</div>
                                        <div className="text-sm text-gray-500">
                                            {new Date(notification.date).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="p-2">{timeAgo(notification.date)}</td>
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
                        {new Date(selectedNotification.date).toLocaleString()}
                    </p>
                    <p className="mt-2">{selectedNotification.content}</p>
                    <p className="mt-2 text-sm text-gray-600">Người gửi: {selectedNotification.sender}</p>
                </div>
            )}
        </div>
    );
}