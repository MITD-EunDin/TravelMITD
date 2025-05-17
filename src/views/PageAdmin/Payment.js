import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CreditCard, Search } from "lucide-react";

const PaymentsPage = () => {
    const [payments, setPayments] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");
    const token = localStorage.getItem("token");

    // Hàm lấy tất cả thanh toán
    const fetchPayments = async () => {
        try {
            if (!token) {
                throw new Error("Chưa đăng nhập");
            }

            const response = await fetch("https://be-travel-mitd.onrender.com/payment/all", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error("Không thể lấy danh sách thanh toán");
            }
            const data = await response.json();
            setPayments(data.result || []);
            setFilteredPayments(data.result || []);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    // Lấy thanh toán khi component mount
    useEffect(() => {
        fetchPayments();
    }, []);

    // Lọc và tìm kiếm thanh toán
    useEffect(() => {
        let result = payments;

        // Lọc theo trạng thái
        if (filter !== "all") {
            result = result.filter((p) => p.status.toLowerCase() === filter.toLowerCase());
        }

        // Tìm kiếm theo mã giao dịch hoặc mã đặt tour
        if (search) {
            result = result.filter(
                (p) =>
                    p.paymentId.toString().toLowerCase().includes(search.toLowerCase()) ||
                    p.bookingId.toString().toLowerCase().includes(search.toLowerCase())
            );
        }

        setFilteredPayments(result);
    }, [filter, search, payments]);

    // Hàm hiển thị trạng thái với màu sắc
    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case "paid":
                return "text-green-600";
            case "pending":
                return "text-yellow-500";
            case "failed":
                return "text-red-600";
            default:
                return "text-gray-600";
        }
    };

    if (loading) {
        return (
            <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Đang tải danh sách thanh toán...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center text-red-500 bg-red-100 rounded-lg mx-auto max-w-screen-xl">
                <p className="font-semibold">Lỗi: {error}</p>
                <button
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={fetchPayments}
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
                    <CreditCard className="mr-2 text-blue-600" size={24} />
                    Quản lý thanh toán (Admin)
                </h2>

                {/* Bộ lọc và tìm kiếm */}
                <div className="flex justify-between mb-4">
                    <div className="relative w-1/3">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Tìm kiếm mã giao dịch, mã đặt tour..."
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
                        <option value="failed">Thất bại</option>
                    </select>
                </div>

                {filteredPayments.length === 0 ? (
                    <p className="text-gray-500 text-center">Không có giao dịch nào.</p>
                ) : (
                    <table className="w-full table-fixed border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-left">
                                <th className="p-3 border-b w-1/6">Mã Giao Dịch</th>
                                <th className="p-3 border-b w-1/6">Mã Đặt Tour</th>
                                <th className="p-3 border-b w-1/6">Số Tiền</th>
                                <th className="p-3 border-b w-1/6">Phương thức</th>
                                <th className="p-3 border-b w-1/6">Trạng Thái</th>
                                <th className="p-3 border-b w-1/6">Ngày</th>
                                <th className="p-3 border-b w-1/6 text-center">Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPayments.map((txn) => (
                                <tr key={txn.paymentId} className="border-b hover:bg-gray-50">
                                    <td className="p-3 whitespace-nowrap text-left">{txn.paymentId}</td>
                                    <td className="p-3 whitespace-nowrap text-left">{txn.bookingId}</td>
                                    <td className="p-3 whitespace-nowrap text-left">{txn.amount.toLocaleString()} VND</td>
                                    <td className="p-3 whitespace-nowrap text-left">{txn.method}</td>
                                    <td className={`p-3 whitespace-nowrap text-left ${getStatusColor(txn.status)}`}>
                                        {txn.status === "PAID" ? "Thành công" : txn.status === "PENDING" ? "Đang chờ" : "Thất bại"}
                                    </td>
                                    <td className="p-3 whitespace-nowrap text-left">
                                        {new Date(txn.paymentDate).toLocaleDateString("vi-VN")}
                                    </td>
                                    <td className="p-3 text-center">
                                        <Link to={`/admin/payments/${txn.bookingId}`}>
                                            <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100">
                                                Chi tiết
                                            </button>
                                        </Link>
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

export default PaymentsPage;