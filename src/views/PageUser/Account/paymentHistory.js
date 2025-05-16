import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Tag, Row, Col, Typography, Modal, message, Spin, Pagination } from "antd";
import {
    CheckCircleTwoTone,
    ClockCircleTwoTone,
    DollarCircleTwoTone,
} from "@ant-design/icons";
import { getMyBookings, getVnpayUrl, makePayment } from '../../../api/BookingApi';

const { Title } = Typography;

const BookingHistory = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState('vnpay');
    const [currentTour, setCurrentTour] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10; // Giới hạn 10 đơn hàng mỗi trang
    const token = localStorage.getItem('token');

    const paymentOptions = [
        { id: 'vnpay', label: 'VNPAY (ATM, Visa, QR Code)', icon: '/vnpay-logo.png' },
        { id: 'momo', label: 'MOMO', icon: '/momo-logo.png' },
        { id: 'bank', label: 'Chuyển khoản ngân hàng', icon: '/bank-icon.png' },
        { id: 'office', label: 'Thanh toán tại văn phòng', icon: '/office-icon.png' },
    ];

    // Lấy danh sách đơn hàng khi component mount
    useEffect(() => {
        const fetchBookings = async () => {
            try {
                setLoading(true);
                if (!token) {
                    throw new Error('Không tìm thấy token. Vui lòng đăng nhập.');
                }
                console.log('Fetching bookings with token:', token.substring(0, 20) + '...');
                const data = await getMyBookings();
                console.log('Bookings:', data);
                // Chuẩn hóa dữ liệu
                const mappedData = data.map(booking => ({
                    id: booking.id,
                    maDatTour: booking.maDatTour,
                    tourName: booking.tourName,
                    bookingDate: booking.bookingDate,
                    departureDate: booking.departureDate || '-',
                    quantity: booking.quantity,
                    total: booking.total,
                    paid: booking.paid,
                    method: booking.method || '-',
                    paymentTime: booking.paymentTime || '-',
                    status: booking.status.toLowerCase() // Chuẩn hóa status
                }));
                const sortedData = mappedData.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
                setBookings(sortedData);
            } catch (error) {
                console.error('Error fetching bookings:', error);
                setError(error.message || 'Không thể tải lịch sử giao dịch. Vui lòng thử lại.');
                if (error.message.includes('token') || error.response?.status === 401) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, [token, navigate]);

    const getStatusTag = (status) => {
        switch (status) {
            case "paid":
                return (
                    <Tag icon={<CheckCircleTwoTone twoToneColor="#52c41a" />} color="success">
                        Đã thanh toán
                    </Tag>
                );
            case "deposited":
                return (
                    <Tag icon={<DollarCircleTwoTone twoToneColor="#1890ff" />} color="processing">
                        Đã đặt cọc
                    </Tag>
                );
            case "pending":
            default:
                return (
                    <Tag icon={<ClockCircleTwoTone twoToneColor="#faad14" />} color="warning">
                        Chưa thanh toán
                    </Tag>
                );
        }
    };

    const handleViewDetail = (tour) => {
        navigate(`/invoices/${tour.id}`, { state: { booking: tour } });
    };

    const showPaymentModal = (tour) => {
        setCurrentTour(tour);
        setSelectedMethod('vnpay');
        setIsModalVisible(true);
    };

    const handleContinuePayment = async () => {
        if (!currentTour) return;

        setLoading(true);
        setIsModalVisible(false);

        const remainingAmount = currentTour.total - currentTour.paid;
        const bookingId = currentTour.id;

        try {
            if (selectedMethod === 'vnpay') {
                const paymentResponse = await getVnpayUrl(bookingId, remainingAmount);
                window.location.href = paymentResponse.result; // Điều chỉnh theo cấu trúc response
            } else {
                const paymentData = {
                    bookingId,
                    amount: remainingAmount,
                    method: selectedMethod.toUpperCase(),
                };
                await makePayment(paymentData);
                message.success('Thanh toán thành công!');
                // Cập nhật state bookings
                setBookings((prev) =>
                    prev.map((tour) =>
                        tour.id === currentTour.id
                            ? {
                                ...tour,
                                status: 'paid',
                                paid: tour.total,
                                paymentTime: new Date().toLocaleString(),
                                method: selectedMethod.toUpperCase(),
                            }
                            : tour
                    )
                );
                navigate('/payment-result?status=success');
            }
        } catch (error) {
            console.error('Payment error:', error);
            message.error(error.message || 'Thanh toán thất bại');
        } finally {
            setLoading(false);
        }
    };

    // Tính toán đơn hàng hiển thị trên trang hiện tại
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const displayedBookings = bookings.slice(startIndex, endIndex);

    return (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-1 xl:grid-cols-1 p-4">
            {error ? (
                <p style={{ color: "red", textAlign: "center" }}>{error}</p>
            ) : loading ? (
                <Spin spinning={loading}>
                    <div style={{ minHeight: "200px", textAlign: "center", padding: "50px" }}>
                        Đang tải...
                    </div>
                </Spin>
            ) : bookings.length === 0 ? (
                <p style={{ textAlign: "center" }}>Không có lịch sử giao dịch.</p>
            ) : (
                <>
                    {displayedBookings.map((tour) => (
                        <Card
                            key={tour.id}
                            style={{
                                borderRadius: 16,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                            }}
                            bodyStyle={{ padding: 20 }}
                        >
                            <Title level={4} style={{ color: "#1677ff", marginBottom: 20 }}>
                                {tour.tourName}
                            </Title>
                            <Row gutter={24}>
                                <Col xs={24} md={12}>
                                    <p><strong>Mã đặt tour:</strong> {tour.maDatTour}</p>
                                    <p><strong>Số lượng:</strong> {tour.quantity} người</p>
                                    <p><strong>Trạng thái:</strong> {getStatusTag(tour.status)}</p>
                                </Col>
                                <Col xs={24} md={12}>
                                    <p><strong>Tổng tiền:</strong> {tour.total.toLocaleString()} VND</p>
                                    <p><strong>Đã thanh toán:</strong> {tour.paid.toLocaleString()} VND</p>
                                    <p><strong>Phương thức:</strong> {tour.method}</p>
                                    <p><strong>Thời gian thanh toán:</strong> {tour.paymentTime}</p>
                                    {tour.status === "pending" && (
                                        <Button type="primary" style={{ marginTop: 8 }}>
                                            Thanh toán
                                        </Button>
                                    )}
                                    {tour.status === "deposited" && (
                                        <Button
                                            type="dashed"
                                            danger
                                            style={{ marginTop: 8 }}
                                            onClick={() => showPaymentModal(tour)}
                                            loading={loading}
                                        >
                                            Thanh toán tiếp
                                        </Button>
                                    )}
                                    {tour.status === "paid" && (
                                        <Button style={{ marginTop: 8 }} onClick={() => handleViewDetail(tour)}>
                                            Xem chi tiết
                                        </Button>
                                    )}
                                </Col>
                            </Row>
                        </Card>
                    ))}
                    <Pagination
                        current={currentPage}
                        pageSize={pageSize}
                        total={bookings.length}
                        onChange={(page) => setCurrentPage(page)}
                        style={{ marginTop: 16, textAlign: 'center' }}
                        showSizeChanger={false}
                    />
                </>
            )}
            <Modal
                title="Chọn phương thức thanh toán"
                visible={isModalVisible}
                onOk={handleContinuePayment}
                onCancel={() => setIsModalVisible(false)}
                okText="Thanh toán"
                cancelText="Hủy"
                width={400}
            >
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {paymentOptions.map((option) => (
                        <label
                            key={option.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: 8,
                                whiteSpace: 'nowrap',
                            }}
                        >
                            <input
                                type="radio"
                                name="payment"
                                checked={selectedMethod === option.id}
                                onChange={() => setSelectedMethod(option.id)}
                                style={{ marginRight: 8 }}
                            />
                            <img
                                src={option.icon}
                                alt={option.label}
                                style={{ width: 24, marginRight: 8 }}
                            />
                            <span style={{ whiteSpace: 'nowrap' }}>{option.label}</span>
                        </label>
                    ))}
                </div>
            </Modal>
        </div>
    );
};

export default BookingHistory;