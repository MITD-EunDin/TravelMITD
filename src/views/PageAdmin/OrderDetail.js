import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Descriptions, Card, Button, message, Tag } from "antd";

const OrderDetail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const booking = location.state?.booking;

    if (!booking) {
        return (
            <div style={{ padding: "24px", textAlign: "center" }}>
                <p style={{ color: "red" }}>Không tìm thấy đơn hàng. Vui lòng quay lại danh sách đơn hàng.</p>
                <Button type="primary" onClick={() => navigate("/admin/orders")}>
                    Quay lại
                </Button>
            </div>
        );
    }

    return (
        <div style={{ padding: "24px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}>
                Chi tiết đơn hàng #{booking.maDatTour}
            </h1>
            <Card style={{ marginBottom: "16px" }}>
                <Descriptions title="Thông tin đơn hàng" bordered column={1}>
                    <Descriptions.Item label="Mã đơn">{booking.maDatTour}</Descriptions.Item>
                    <Descriptions.Item label="Tên tour">{booking.tourName}</Descriptions.Item>
                    <Descriptions.Item label="Khách hàng">{booking.customer}</Descriptions.Item>
                    <Descriptions.Item label="Ngày đặt">{booking.bookingDate}</Descriptions.Item>
                    <Descriptions.Item label="Ngày khởi hành">{booking.departureDate || "-"}</Descriptions.Item>
                    <Descriptions.Item label="Số lượng">{booking.quantity}</Descriptions.Item>
                    <Descriptions.Item label="Tổng tiền">
                        {booking.total?.toLocaleString()} VND
                    </Descriptions.Item>
                    <Descriptions.Item label="Đã thanh toán">
                        {booking.paid?.toLocaleString()} VND
                    </Descriptions.Item>
                    <Descriptions.Item label="Phương thức thanh toán">{booking.method || "-"}</Descriptions.Item>
                    <Descriptions.Item label="Thời gian thanh toán">{booking.paymentTime || "-"}</Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        {booking.status.toLowerCase() === "paid" ? (
                            <Tag color="success">Đã thanh toán</Tag>
                        ) : booking.status.toLowerCase() === "deposited" ? (
                            <Tag color="processing">Đã đặt cọc</Tag>
                        ) : (
                            <Tag color="warning">Chưa thanh toán</Tag>
                        )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Nhân viên chăm sóc">{booking.employee || "-"}</Descriptions.Item>
                </Descriptions>
            </Card>
            <Button type="primary" onClick={() => navigate("/admin/orders")}>
                Quay lại
            </Button>
        </div>
    );
};

export default OrderDetail;