import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { CreditCard, ArrowLeft } from "lucide-react";
import { getMyInfo } from "../../api/Api";

const PaymentDetailPage = () => {
    const { bookingId } = useParams();
    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const token = localStorage.getItem("token");

    // Lấy thông tin vai trò người dùng
    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                if (!token) {
                    throw new Error("Không tìm thấy token đăng nhập");
                }
                const userData = await getMyInfo(token);
                console.log("data: ", userData);
                if (userData && userData.roles && userData.roles.length > 0) {
                    setUserRole(userData.roles[0]);
                } else {
                    throw new Error("Dữ liệu người dùng không hợp lệ");
                }
            } catch (err) {
                console.error("Lỗi lấy vai trò:", err);
                setError(err.message);
            }
        };
        fetchUserRole();
    }, [token]);

    // Lấy chi tiết giao dịch theo bookingId
    useEffect(() => {
        const fetchPaymentDetail = async () => {
            try {
                if (!token) {
                    throw new Error("Không tìm thấy token đăng nhập");
                }
                const response = await fetch(`https://be-travel-mitd.onrender.com/payment/${bookingId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) throw new Error("Không thể lấy chi tiết giao dịch");
                const data = await response.json();
                setPayment(data.result);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };
        fetchPaymentDetail();
    }, [bookingId, token]);

    if (loading) return <div className="p-6 text-center">Đang tải...</div>;
    if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
    if (!payment) return <div className="p-6 text-center">Không tìm thấy thông tin booking</div>;

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

    const getPaymentTypeLabel = (txn, parentPayment) => {
        const isFullPayment = txn.amount === parentPayment.totalBookingAmount && txn.remainingAmount === 0;
        const isDeposit = txn.amount < parentPayment.totalBookingAmount && txn.remainingAmount > 0 && parentPayment.bookingStatus === "DEPOSITED";
        const isRemaining = parentPayment.relatedPayments?.length > 1 && txn.remainingAmount === 0;

        if (isFullPayment) return "Thanh toán toàn bộ";
        if (isDeposit) return "Đặt cọc";
        if (isRemaining) return "Thanh toán phần còn lại";
        return "Không xác định";
    };

    const handleCreateRemainingPayment = async () => {
        try {
            const response = await fetch(
                `https://be-travel-mitd.onrender.com/payment/vnpay-url?bookingId=${payment.bookingId}&amount=${payment.remainingAmount}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (!response.ok) throw new Error("Không thể tạo thanh toán phần còn lại");
            const data = await response.json();
            window.location.href = data.result; // Chuyển hướng đến URL thanh toán VNPay
        } catch (err) {
            alert("Lỗi: " + err.message);
        }
    };

    return (
        <div className="p-6 max-w-screen-xl mx-auto">
            <Link to={userRole === "ADMIN" ? "/admin/payments" : "/payments"} className="flex items-center text-blue-600 mb-4">
                <ArrowLeft size={20} className="mr-2" /> Quay lại
            </Link>
            <div className="border rounded-lg p-6 bg-white shadow-md space-y-6">
                <h2 className="text-xl font-bold flex items-center">
                    <CreditCard className="mr-2 text-blue-600" size={24} />
                    Chi tiết giao dịch của Booking #{payment.bookingId}
                </h2>

                {/* Thông tin booking */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p><strong>Mã đặt tour:</strong> {payment.bookingId}</p>
                        <p><strong>Tên tour:</strong> {payment.tourName}</p>
                        <p><strong>Trạng thái booking:</strong> {payment.bookingStatus}</p>
                        <p><strong>Khách hàng:</strong> {payment.customer.name} (ID: {payment.customer.id})</p>
                        <p><strong>Số điện thoại:</strong> {payment.customer.phone}</p>
                        <p><strong>Email:</strong> {payment.customer.email}</p>
                        <p><strong>Ngày khởi hành:</strong> {payment.departureDate !== "Chưa xác định" ? new Date(payment.departureDate).toLocaleDateString("vi-VN") : "Chưa xác định"}</p>
                        {userRole === "ADMIN" && payment.employee && (
                            <p><strong>Nhân viên phụ trách:</strong> {payment.employee.name} (ID: {payment.employee.id})</p>
                        )}
                    </div>
                    <div>
                        <p><strong>Tổng chi phí tour:</strong> {payment.totalBookingAmount.toLocaleString()} VND</p>
                        <p><strong>Số lượng khách:</strong> {payment.adultQuantity} người lớn, {payment.childQuantity} trẻ em</p>
                        <p><strong>Đã thanh toán:</strong> {(payment.totalBookingAmount - payment.remainingAmount).toLocaleString()} VND</p>
                        <p><strong>Còn lại:</strong> {payment.remainingAmount.toLocaleString()} VND</p>
                        <p><strong>Ngày thanh toán gần nhất:</strong> {payment.paymentDate ? new Date(payment.paymentDate).toLocaleString("vi-VN") : "Chưa có giao dịch"}</p>
                    </div>
                </div>

                {/* Cảnh báo hạn thanh toán */}
                {payment.remainingAmount > 0 && payment.bookingStatus === "DEPOSITED" && (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
                        <p className="text-yellow-700">
                            Cần thanh toán phần còn lại ({payment.remainingAmount.toLocaleString()} VND) trước ngày{" "}
                            {payment.departureDate !== "Chưa xác định" ? new Date(payment.departureDate).toLocaleDateString("vi-VN") : "chưa xác định"}!
                        </p>
                    </div>
                )}

                {/* Tất cả giao dịch của booking */}
                {payment.relatedPayments?.length > 0 && (
                    <div className="border-t pt-4">
                        <h3 className="text-lg font-semibold mb-2">Tất cả giao dịch của Booking #{payment.bookingId}</h3>
                        <table className="w-full table-fixed border-collapse">
                            <thead>
                                <tr className="bg-gray-100 text-left">
                                    <th className="p-3 border-b w-1/5">Mã Giao Dịch</th>
                                    <th className="p-3 border-b w-1/5">Loại</th>
                                    <th className="p-3 border-b w-1/5">Số Tiền</th>
                                    <th className="p-3 border-b w-1/5">Trạng Thái</th>
                                    <th className="p-3 border-b w-1/5">Ngày</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payment.relatedPayments.map((txn) => (
                                    <tr key={txn.paymentId} className="border-b hover:bg-gray-50">
                                        <td className="p-3">{txn.paymentId}</td>
                                        <td className="p-3">{getPaymentTypeLabel(txn, payment)}</td>
                                        <td className="p-3">{txn.amount.toLocaleString()} VND</td>
                                        <td className={`p-3 ${getStatusColor(txn.status)}`}>{txn.status}</td>
                                        <td className="p-3">{new Date(txn.paymentDate).toLocaleString("vi-VN")}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Hành động */}
                <div className="flex space-x-4">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Tải hóa đơn
                    </button>
                    {payment.remainingAmount > 0 && payment.bookingStatus === "DEPOSITED" && (
                        <button
                            onClick={handleCreateRemainingPayment}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            Tạo thanh toán phần còn lại
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentDetailPage;