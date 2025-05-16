import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Search } from "lucide-react";
import { useAuth } from "../../Contexts/AuthContext";

const EmployeeOrders = () => {
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");

    const fetchOrders = async () => {
        try {
            if (!token) throw new Error("Chưa đăng nhập");
            const response = await fetch("http://localhost:8080/employee/orders", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("Không thể lấy danh sách đơn hàng");
            const data = await response.json();
            console.log("EmployeeOrders - API response:", data);
            setOrders(data.result || []);
            setFilteredOrders(data.result || []);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        try {
            const response = await fetch(`http://localhost:8080/employee/orders/${orderId}/status`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(status),
            });
            if (!response.ok) throw new Error("Cập nhật trạng thái thất bại");
            alert("Cập nhật trạng thái thành công!");
            fetchOrders(); // Tải lại danh sách
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [token]);

    useEffect(() => {
        let result = orders;
        if (filter !== "all") {
            result = result.filter((o) => o.status.toLowerCase() === filter.toLowerCase());
        }
        if (search) {
            result = result.filter(
                (o) =>
                    o.orderId.toString().toLowerCase().includes(search.toLowerCase()) ||
                    (o.customerName && o.customerName.toLowerCase().includes(search.toLowerCase()))
            );
        }
        setFilteredOrders(result);
    }, [filter, search, orders]);

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case "paid":
                return "text-green-600";
            case "pending":
                return "text-yellow-500";
            case "cancelled":
                return "text-red-600";
            default:
                return "text-gray-600";
        }
    };

    if (loading) {
        return (
            <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Đang tải danh sách đơn hàng...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center text-red-500 bg-red-100 rounded-lg mx-auto max-w-screen-xl">
                <p className="font-semibold">Lỗi: {error}</p>
                <button
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={fetchOrders}
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
                    <ShoppingCart className="mr-2 text-blue-600" size={24} />
                    Quản lý Đơn hàng (Nhân viên)
                </h2>
                <div className="flex justify-between mb-4">
                    <div className="relative w-1/3">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Tìm kiếm mã đơn, khách hàng..."
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">Tất cả</option>
                        <option value="paid">Thành công</option>
                        <option value="pending">Đang chờ</option>
                        <option value="cancelled">Đã hủy</option>
                    </select>
                </div>
                {filteredOrders.length === 0 ? (
                    <p className="text-gray-500 text-center">Không có đơn hàng nào.</p>
                ) : (
                    <table className="w-full table-fixed border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-left">
                                <th className="p-3 border-b w-1/6">Mã Đơn</th>
                                <th className="p-3 border-b w-1/6">Khách Hàng</th>
                                <th className="p-3 border-b w-1/6">Tour</th>
                                <th className="p-3 border-b w-1/6">Số Tiền</th>
                                <th className="p-3 border-b w-1/6">Trạng Thái</th>
                                <th className="p-3 border-b w-1/6">Ngày</th>
                                <th className="p-3 border-b w-1/6 text-center">Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order) => (
                                <tr key={order.orderId} className="border-b hover:bg-gray-50">
                                    <td className="p-3 whitespace-nowrap text-left">{order.orderId}</td>
                                    <td className="p-3 whitespace-nowrap text-left">{order.customerName}</td>
                                    <td className="p-3 whitespace-nowrap text-left">{order.tourName}</td>
                                    <td className="p-3 whitespace-nowrap text-left">{order.amount.toLocaleString()} VND</td>
                                    <td className={`p-3 whitespace-nowrap text-left ${getStatusColor(order.status)}`}>
                                        {order.status === "PAID" ? "Thành công" : order.status === "PENDING" ? "Đang chờ" : "Đã hủy"}
                                    </td>
                                    <td className="p-3 whitespace-nowrap text-left">
                                        {order.orderDate ? new Date(order.orderDate).toLocaleDateString("vi-VN") : "N/A"}
                                    </td>
                                    <td className="p-3 text-center">
                                        <Link to={`/employee/orders/${order.orderId}`}>
                                            <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100">
                                                Chi tiết
                                            </button>
                                        </Link>
                                        {order.status !== "PAID" && order.status !== "CANCELLED" && (
                                            <button
                                                onClick={() => updateOrderStatus(order.orderId, "PAID")}
                                                className="ml-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                            >
                                                Xác nhận thanh toán
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default EmployeeOrders;