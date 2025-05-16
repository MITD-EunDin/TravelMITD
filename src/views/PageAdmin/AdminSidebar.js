import { Link, useLocation, Outlet } from "react-router-dom";
import { Home, Users, ClipboardList, Briefcase, UsersRound, Package, ShoppingCart, Bell, Star, CreditCard, Settings, LogOut } from "lucide-react";
import { useAuth } from "../../Contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export function AdminSidebar() {
    const location = useLocation();
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    }
    const menuItems = [
        { id: "dashboard", label: "Tổng quan", icon: <Home size={20} />, path: "/admin/dashboard" },
        { id: "employees", label: "Quản lý Nhân viên", icon: <Briefcase size={20} />, path: "/admin/employees" },
        { id: "customers", label: "Quản lý Khách hàng", icon: <UsersRound size={20} />, path: "/admin/customers" },
        { id: "tours", label: "Quản lý Tour", icon: <Package size={20} />, path: "/admin/tours" },
        { id: "orders", label: "Quản lý Đơn hàng", icon: <ShoppingCart size={20} />, path: "/admin/orders" },
        { id: "notifications", label: "Thông báo", icon: <Bell size={20} />, path: "/admin/notifications" },
        { id: "reviews", label: "Quản lý Đánh giá", icon: <Star size={20} />, path: "/admin/reviews" },
        { id: "payments", label: "Thanh toán", icon: <CreditCard size={20} />, path: "/admin/payments" },
        { id: "settings", label: "Cấu hình chung", icon: <Settings size={20} />, path: "/admin/settings" },
    ];

    return (
        <div className="h-screen w-64 bg-gray-900 text-white flex flex-col fixed">
            <div className="p-5 text-xl font-bold border-b border-gray-700">Admin Panel</div>
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
            <button className="flex items-center gap-3 p-3 border-t border-gray-700 hover:bg-red-600 transition-all duration-200" onClick={handleLogout}>
                <LogOut size={20} />
                <span>Đăng xuất</span>
            </button>
        </div>
    );
}

export default function AdminLayout() {
    return (
        <div className="flex min-h-screen">
            <AdminSidebar />
            <div className="flex-1 p-6 bg-gray-100 ml-64">
                <Outlet />
            </div>

        </div>
    );
}
