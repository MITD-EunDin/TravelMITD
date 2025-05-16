import React, { useState, useEffect } from "react";
import { Bell, Mail, MailOpen } from "lucide-react";
import { useAuth } from "../../Contexts/AuthContext";

const EmployeeNotifications = () => {
    const { token } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchNotifications = async () => {
        try {
            if (!token) throw new Error("Chưa đăng nhập");
            const response = await fetch("http://localhost:8080/notifications/user", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("Không thể lấy thông báo");
            const data = await response.json();
            console.log("EmployeeNotifications - API response:", data);
            setNotifications(data.result || []);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            const response = await fetch(`http://localhost:8080/notifications/${notificationId}/read`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("Đánh dấu đã đọc thất bại");
            alert("Đánh dấu đã đọc thành công!");
            fetchNotifications(); // Tải lại danh sách
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [token]);

    if (loading) {
        return (
            <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Đang tải thông báo...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center text-red-500 bg-red-100 rounded-lg mx-auto max-w-screen-xl">
                <p className="font-semibold">Lỗi: {error}</p>
                <button
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={fetchNotifications}
                >
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-md">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                    <Bell className="mr-2 text-blue-600" size={24} />
                    Thông báo (Nhân viên)
                </h2>
                {notifications.length === 0 ? (
                    <p className="text-gray-500 text-center">Không có thông báo nào.</p>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className="p-4 rounded-md bg-gray-50 hover:bg-gray-100 flex items-center justify-between"
                            >
                                <div className="flex items-center">
                                    <div className="mr-3">
                                        {notification.isRead ? (
                                            <MailOpen size={20} className="text-gray-500" />
                                        ) : (
                                            <Mail size={20} className="text-blue-500" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-md font-semibold">{notification.title}</p>
                                        <p className="text-sm text-gray-500">{notification.message}</p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(notification.createdAt).toLocaleString("vi-VN")}
                                        </p>
                                    </div>
                                </div>
                                {!notification.isRead && (
                                    <button
                                        onClick={() => markAsRead(notification.id)}
                                        className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Đánh dấu đã đọc
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeNotifications;