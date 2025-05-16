import React, { useState, useEffect } from "react";
import { useNavigate, NavLink, Outlet } from "react-router-dom";
import { Menu, X, User, ShoppingCart, Bell, Mail, MailOpen, Heart } from "lucide-react";
import { getNotifications, markNotificationAsRead, connectWebSocket } from '../../api/Notification';
import './Navbar.scss'
import logodtc from '../../assets/logoDTC.png'

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
        date: notification.createdAt || new Date().toISOString(),
        content: notification.message || 'No Content',
        sender: "Hệ thống",
        status: notification.isRead ? "Đã đọc" : "Chưa đọc"
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

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [error, setError] = useState(null);
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
                setNotifications(mappedData);
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

    const handleViewAllNotifications = () => {
        setShowNotifications(false);
        navigate("/account/notification");
    }

    // Hàm đánh dấu thông báo đã đọc
    const handleMarkAsRead = async (notificationId) => {
        try {
            console.log('Attempting to mark notification as read, ID:', notificationId);
            await markNotificationAsRead(notificationId, token);
            setNotifications((prev) => {
                const updatedNotifications = prev.map((n) =>
                    n.backendId === notificationId ? { ...n, status: "Đã đọc" } : n
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
        if (notification.status === "Chưa đọc" && notification.backendId) {
            handleMarkAsRead(notification.backendId);
        } else {
            console.log('Notification already read or invalid ID:', notification.id);
        }
    };

    // Tính số thông báo chưa đọc
    const unreadCount = notifications.filter(n => n.status === "Chưa đọc").length;

    return (
        <nav className="bg-[#071635] shadow-md p-4 w-full">
            <div className="max-w-screen-xl mx-auto flex justify-between items-center">
                {/* Logo */}
                <div className="text-xl font-bold">
                    <img src={logodtc} alt="LOGO" className="h-10" />
                </div>

                {/* Desktop Menu */}
                <ul className="hidden md:flex space-x-6">
                    {["Trang chủ", "Giới thiệu", "Tour du lịch", "Dịch vụ", "Tin tức"].map((item, index) => {
                        const paths = ["/", "/introduce", "/tours", "/detailservice", "/news"];
                        return (
                            <li key={index}>
                                <NavLink
                                    to={paths[index]}
                                    className={({ isActive }) =>
                                        `text-2xl text-white hover:text-blue-600 ${isActive ? "text-blue-600 font-bold" : ""}`
                                    }
                                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                                >
                                    {item}
                                </NavLink>
                            </li>
                        );
                    })}
                </ul>

                {/* Icons */}
                <div className="hidden md:flex space-x-4">
                    <User
                        className="w-6 h-6 cursor-pointer text-2xl text-white hover:text-blue-600"
                        onClick={() => navigate("/account")}
                    />
                    <Heart
                        className="w-6 h-6 cursor-pointer text-2xl text-white hover:text-blue-600"
                        onClick={() => navigate("/account/favorites")}
                    />
                    <div className="relative">
                        <Bell
                            className="w-6 h-6 cursor-pointer text-2xl text-white hover:text-blue-600"
                            onClick={() => setShowNotifications(!showNotifications)}
                        />
                        {unreadCount > 0 && (
                            <span className="absolute bottom-4 left-3 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                        {/* Dropdown thông báo */}
                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-[500px] bg-white rounded-lg shadow-lg border max-h-[500px] flex flex-col z-50">

                                {/* Tiêu đề cố định */}
                                <div className="flex justify-between items-center border-b h-16 px-4">
                                    <h3 className="text-xxl font-semibold mt-4">Thông báo</h3>
                                    <button onClick={() => setShowNotifications(false)}>
                                        <X size={20} className="text-gray-500 hover:text-gray-700" />
                                    </button>
                                </div>

                                {/* Danh sách thông báo cuộn được */}
                                <div className="overflow-y-auto max-h-[360px]">
                                    {error ? (
                                        <p className="p-4 text-red-500">{error}</p>
                                    ) : notifications.length === 0 ? (
                                        <p className="p-4 text-gray-500">Không có thông báo nào.</p>
                                    ) : (
                                        <>
                                            {notifications.map((notification) => (
                                                <div
                                                    key={notification.id}
                                                    className="m-2 p-4 rounded-md bg-[#f8f9ff] hover:bg-[#e6e9ff] cursor-pointer flex items-center"
                                                    onClick={() => handleNotificationClick(notification)}
                                                >
                                                    <div className="relative mr-3">
                                                        {notification.status === "Chưa đọc" ? (
                                                            <>
                                                                <Mail size={20} className="text-blue-500" />
                                                                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                                                            </>
                                                        ) : (
                                                            <MailOpen size={20} className="text-gray-500" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-md font-semibold">{notification.title}</p>
                                                        <p className="text-sm text-gray-500">{notification.content}</p>
                                                        <p className="text-xs text-gray-400">{timeAgo(notification.date)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>

                                {/* "Xem tất cả" cố định ở dưới */}
                                <div
                                    className="text-center p-3 text-blue-600 hover:underline hover:bg-gray-100 cursor-pointer text-sm font-medium border-t"
                                    onClick={handleViewAllNotifications}
                                >
                                    Xem tất cả thông báo
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? (
                        <X className="w-6 h-6" />
                    ) : (
                        <div className="flex space-x-4 items-center">
                            <User
                                className="w-6 h-6 cursor-pointer text-2xl text-white hover:text-blue-600"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate("/account");
                                }}
                            />
                            <ShoppingCart
                                className="w-6 h-6 cursor-pointer text-2xl text-white hover:text-blue-600"
                            />
                            <div className="relative">
                                <Bell
                                    className="w-6 h-6 cursor-pointer text-2xl text-white hover:text-blue-600"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowNotifications(!showNotifications);
                                    }}
                                />
                                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                        {unreadCount}
                                    </span>
                                )}
                                {/* Dropdown thông báo cho mobile */}
                                {showNotifications && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border max-h-96 overflow-y-auto z-50">
                                        <div className="flex justify-between items-center p-4 border-b">
                                            <h3 className="text-lg font-semibold">Thông báo</h3>
                                            <button onClick={() => setShowNotifications(false)}>
                                                <X size={20} className="text-gray-500 hover:text-gray-700" />
                                            </button>
                                        </div>
                                        {error ? (
                                            <p className="p-4 text-red-500">{error}</p>
                                        ) : notifications.length === 0 ? (
                                            <p className="p-4 text-gray-500">Không có thông báo nào.</p>
                                        ) : (
                                            notifications.map((notification) => (
                                                <div
                                                    key={notification.id}
                                                    className="p-4 border-b hover:bg-gray-100 cursor-pointer flex items-center"
                                                    onClick={() => handleNotificationClick(notification)}
                                                >
                                                    <div className="relative mr-3">
                                                        {notification.status === "Chưa đọc" ? (
                                                            <>
                                                                <Mail size={20} className="text-blue-500" />
                                                                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                                                            </>
                                                        ) : (
                                                            <MailOpen size={20} className="text-gray-500" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold">{notification.title}</p>
                                                        <p className="text-xs text-gray-500">{notification.content}</p>
                                                        <p className="text-xs text-gray-400">{timeAgo(notification.date)}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                            <Menu className="w-6 h-6" />
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <ul className="md:hidden flex flex-col items-center space-y-4 mt-4 text-white">
                    {["Trang chủ", "Giới thiệu", "Tour du lịch", "Dịch vụ", "Tin tức"].map((item, index) => {
                        const paths = ["/", "/introduce", "/tours", "/detailservice", "/news"];
                        return (
                            <li key={index}>
                                <NavLink
                                    to={paths[index]}
                                    className={({ isActive }) =>
                                        `text-2xl text-white hover:text-blue-600 ${isActive ? "text-blue-600 font-bold" : ""}`
                                    }
                                    onClick={() => setIsOpen(false)}
                                >
                                    {item}
                                </NavLink>
                            </li>
                        );
                    })}
                </ul>
            )}
        </nav>
    );
}

function UserLayout({ children }) {
    return (
        <>
            <Navbar />
            <main>
                <Outlet />
            </main>
        </>
    );
}

export default UserLayout;