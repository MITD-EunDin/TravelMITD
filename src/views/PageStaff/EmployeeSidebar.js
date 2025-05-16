import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingCart, Package, Bell, User, LogOut } from "lucide-react";
import { useAuth } from "../../Contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export function EmployeeSidebar() {
    const location = useLocation();
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const menuItems = [
        { id: "dashboard", label: "Tổng quan cá nhân", icon: <Home size={20} />, path: "/employee/dashboard" },
        { id: "orders", label: "Quản lý Đơn hàng", icon: <ShoppingCart size={20} />, path: "/employee/orders" },
        { id: "tours", label: "Danh sách Tour", icon: <Package size={20} />, path: "/employee/tours" },
        { id: "notifications", label: "Thông báo", icon: <Bell size={20} />, path: "/employee/notifications" },
        { id: "profile", label: "Hồ sơ cá nhân", icon: <User size={20} />, path: "/employee/profile" },
    ];

    return (
        <div className="h-screen w-64 bg-gray-900 text-white flex flex-col fixed">
            <div className="p-5 text-xl font-bold border-b border-gray-700">Employee Panel</div>
            <nav className="flex-1 p-3 space-y-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.id}
                        to={item.path}
                        className={`flex items-center gap-3 p-3 rounded-md transition-all duration-200 ${location.pathname === item.path ? "bg-gray-700" : "hover:bg-gray-800"
                            }`}
                    >
                        {item.icon}
                        <span>{item.label}</span>
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
        </div>
    );
}