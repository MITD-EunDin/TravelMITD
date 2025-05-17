import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingCart, Package, Bell, User, LogOut } from "lucide-react";
import { useAuth } from "../../Contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getNotifications } from '../../api/Notification';

export function EmployeeSidebar() {
    const location = useLocation();
    const { logout, token } = useAuth();
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);
    const [error, setError] = useState(null);

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

    // Lấy thông báo để đếm số chưa đọc
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                if (!token) {
                    throw new Error('No token found');
                }
                const userId = getUserIdFromToken(token);
                console.log('Sidebar - Fetching notifications for userId:', userId);
                const data = await getNotifications(token);
                console.log('Sidebar - API Notifications:', data);
                // Lọc thông báo được phân công hoặc không có assignedTo
                const assignedNotifications = data.filter(
                    n => n.assignedTo === userId || n.assignedTo === undefined
                );
                // Đếm số thông báo chưa đọc
                const unread = assignedNotifications.filter(n => !n.isRead).length;
                setUnreadCount(unread);
            } catch (error) {
                console.error('Sidebar - Error fetching notifications:', error);
                setError('Không thể lấy thông báo.');
            }
        };
        if (token) {
            fetchNotifications();
        }
    }, [token]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const menuItems = [
        { id: "dashboard", label: "Tổng quan cá nhân", icon: <Home size={20} />, path: "/employee/dashboard" },
        { id: "orders", label: "Quản lý Đơn hàng", icon: <ShoppingCart size={20} />, path: "/employee/orders" },
        { id: "tours", label: "Danh sách Tour", icon: <Package size={20} />, path: "/employee/tours" },
        {
            id: "notifications",
            label: "Thông báo",
            icon: <Bell size={20} />,
            path: "/employee/notifications",
            unreadCount: unreadCount // Thêm unreadCount cho mục Thông báo
        },
        { id: "profile", label: "Hồ sơ cá nhân", icon: <User size={20} />, path: "/employee/profile" },
    ];

    return (
        <div className="h-screen w-64 bg-gray-900 text-white flex flex-col fixed">
            <div className="p-5 text-xl font-bold border-b border-gray-700">Employee Panel</div>
            {error && (
                <div className="p-3 text-red-400 text-sm">{error}</div>
            )}
            <nav className="flex-1 p-3 space-y-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.id}
                        to={item.path}
                        className={`flex items-center gap-3 p-3 rounded-md transition-all duration-200 relative ${location.pathname === item.path ? "bg-gray-700" : "hover:bg-gray-800"
                            }`}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                        {item.id === "notifications" && item.unreadCount > 0 && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {item.unreadCount}
                            </span>
                        )}
                    </Link>
                ))}
            </nav>
            <button
                className="flex items-center gap-3 p-3 border-t border-gray-700 hover:bg-red-600 transition-all duration-200"
                onClick={handleLogout}
            >
                <LogOut size={20} />
                <span>Đăng xuất</span>
            </button>
        </div >
    );
}