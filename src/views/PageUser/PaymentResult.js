import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Result, Button, Card, Descriptions, Tag } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

const PaymentResult = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const status = new URLSearchParams(location.search).get("status");
    const booking = location.state?.booking;

    const getResultProps = () => {
        switch (status) {
            case "success":
                return {
                    status: "success",
                    title: "Thanh toán thành công!",
                    subTitle: booking
                        ? `Đơn hàng #${booking.maDatTour} đã được thanh toán đầy đủ. Cảm ơn bạn đã chọn chúng tôi!`
                        : "Thanh toán của bạn đã được xử lý thành công.",
                    icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
                };
            case "failed":
                return {
                    status: "error",
                    title: "Thanh toán thất bại",
                    subTitle: "Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.",
                    icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
                };
            case "already_processed":
                return {
                    status: "info",
                    title: "Thanh toán đã được xử lý",
                    subTitle: "Đơn hàng này đã được thanh toán trước đó.",
                };
            default:
                return {
                    status: "info",
                    title: "Trạng thái không xác định",
                    subTitle: "Không thể xác định trạng thái thanh toán. Vui lòng liên hệ hỗ trợ.",
                };
        }
    };

    return (
        <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
            <Result
                {...getResultProps()}
                extra={[
                    <Button
                        type="primary"
                        key="history"
                        onClick={() => navigate("/booking-history")}
                    >
                        Quay lại lịch sử giao dịch
                    </Button>,
                    booking && (
                        <Button
                            key="detail"
                            onClick={() => navigate(`/billdetail`, { state: { booking } })}
                        >
                            Xem chi tiết đơn hàng
                        </Button>
                    ),
                ]}
            />
            {booking && (
                <Card style={{ marginTop: "24px" }}>
                    <Descriptions title="Thông tin đơn hàng" bordered column={1}>
                        <Descriptions.Item label="Mã đơn">{booking.maDatTour}</Descriptions.Item>
                        <Descriptions.Item label="Tên tour">{booking.tourName}</Descriptions.Item>
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
                            {booking.status === "paid" ? (
                                <Tag color="success">Đã thanh toán</Tag>
                            ) : booking.status === "deposited" ? (
                                <Tag color="processing">Đã đặt cọc</Tag>
                            ) : (
                                <Tag color="warning">Chưa thanh toán</Tag>
                            )}
                        </Descriptions.Item>
                    </Descriptions>
                </Card>
            )}
        </div>
    );
};

export default PaymentResult;