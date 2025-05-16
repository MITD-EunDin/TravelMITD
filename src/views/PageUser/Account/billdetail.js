import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Alert, Button, Table, Tag, Row, Col, Typography, Space } from 'antd';
import { PrinterOutlined, DollarOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const InvoiceDetail = () => {
    const { bookingId } = useParams(); // Lấy bookingId từ URL
    const navigate = useNavigate();
    const [paymentDetail, setPaymentDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('token'); // Lấy token từ localStorage

    // Gọi API để lấy chi tiết giao dịch
    useEffect(() => {
        const fetchPaymentDetail = async () => {
            try {
                if (!token) {
                    throw new Error('Không tìm thấy token đăng nhập');
                }
                if (!bookingId || bookingId === 'undefined') {
                    throw new Error('Mã booking không hợp lệ');
                }
                const response = await fetch(`http://localhost:8080/payment/${bookingId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Không thể lấy chi tiết giao dịch');
                }
                const data = await response.json();
                setPaymentDetail(data.result);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };
        fetchPaymentDetail();
    }, [bookingId, token]);

    const handlePrint = () => {
        window.print();
    };

    const paymentColumns = [
        {
            title: 'Payment ID',
            dataIndex: 'paymentId',
            key: 'paymentId',
        },
        {
            title: 'Số tiền (VND)',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => amount.toLocaleString(),
        },
        {
            title: 'Phương thức',
            dataIndex: 'method',
            key: 'method',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'PAID' ? 'green' : 'orange'}>
                    {status === 'PAID' ? 'Đã thanh toán' : 'Đang xử lý'}
                </Tag>
            ),
        },
        {
            title: 'Thời gian',
            dataIndex: 'paymentDate',
            key: 'paymentDate',
            render: (date) => (date ? new Date(date).toLocaleString() : '-'),
        },
    ];

    if (error) {
        return (
            <div className="page-container container max-w-screen-xl mx-auto" style={{ padding: '20px' }}>
                <Alert message={error} type="error" showIcon />
            </div>
        );
    }

    if (loading || !paymentDetail) {
        return (
            <div className="page-container container max-w-screen-xl mx-auto" style={{ padding: '20px' }}>
                <Alert message="Đang tải..." type="info" showIcon />
            </div>
        );
    }

    const paidAmount = paymentDetail.relatedPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const remainingAmount = paymentDetail.totalBookingAmount - paidAmount;

    return (
        <div className="page-container container max-w-screen-xl mx-auto" style={{ padding: '20px' }}>
            <Card style={{ borderRadius: 8, maxWidth: 800, margin: '0 auto' }} className="printable">
                {/* Header */}
                <Row align="middle" justify="space-between">
                    <Col>
                        <img src={""} alt="Company Logo" style={{ height: 50 }} />
                    </Col>
                    <Col>
                        <Title level={3}>Hóa Đơn Đặt Tour</Title>
                        <Text strong>Mã đặt tour: TOUR{paymentDetail.bookingId.toString().padStart(5, '0')}</Text>
                    </Col>
                </Row>

                {/* Customer Info */}
                <Card style={{ marginTop: 16, background: '#f9f9f9' }}>
                    <Title level={4}><UserOutlined /> Thông Tin Khách Hàng</Title>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Text><strong>Họ và tên:</strong> {paymentDetail.customer.name}</Text><br />
                            <Text><strong>Email:</strong> {paymentDetail.customer.email}</Text>
                        </Col>
                        <Col span={12}>
                            <Text><strong>Điện thoại:</strong> {paymentDetail.customer.phone}</Text><br />
                            <Text><strong>ID khách hàng:</strong> {paymentDetail.customer.id}</Text>
                        </Col>
                    </Row>
                </Card>

                {/* Tour Info */}
                <Card style={{ marginTop: 16 }}>
                    <Title level={4}>Thông Tin Tour</Title>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Text><strong>Tên tour:</strong> {paymentDetail.tourName}</Text><br />
                            <Text><CalendarOutlined /> <strong>Ngày thanh toán gần nhất:</strong> {paymentDetail.paymentDate ? new Date(paymentDetail.paymentDate).toLocaleString() : 'Chưa có giao dịch'}</Text><br />
                            <Text><CalendarOutlined /> <strong>Khởi hành:</strong> {paymentDetail.departureDate !== 'Chưa xác định' ? paymentDetail.departureDate : 'N/A'}</Text>
                        </Col>
                        <Col span={12}>
                            <Text><UserOutlined /> <strong>Số người:</strong> {paymentDetail.adultQuantity} người lớn, {paymentDetail.childQuantity} trẻ em</Text><br />
                            <Text>
                                <strong>Trạng thái:</strong>{' '}
                                <Tag color={paymentDetail.bookingStatus === 'PAID' ? 'green' : paymentDetail.bookingStatus === 'DEPOSITED' ? 'orange' : 'red'}>
                                    {paymentDetail.bookingStatus === 'PAID' ? 'Đã thanh toán' : paymentDetail.bookingStatus === 'DEPOSITED' ? 'Đã đặt cọc' : 'Chưa thanh toán'}
                                </Tag>
                            </Text>
                        </Col>
                    </Row>
                </Card>

                {/* Financial Info */}
                <Card style={{ marginTop: 16 }}>
                    <Title level={4}><DollarOutlined /> Thông Tin Tài Chính</Title>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Text><strong>Tổng tiền:</strong> {paymentDetail.totalBookingAmount.toLocaleString()} VND</Text><br />
                            <Text><strong>Đã thanh toán:</strong> {paidAmount.toLocaleString()} VND ({((paidAmount / paymentDetail.totalBookingAmount) * 100).toFixed(2)}%)</Text>
                        </Col>
                        <Col span={12}>
                            <Text><strong>Còn lại:</strong> {remainingAmount.toLocaleString()} VND</Text><br />
                            <Text><strong>Phương thức:</strong> {paymentDetail.relatedPayments.length > 0 ? paymentDetail.relatedPayments[0].method : '-'}</Text>
                        </Col>
                    </Row>
                </Card>

                {/* Payment Details */}
                <Card style={{ marginTop: 16 }}>
                    <Title level={4}>Chi Tiết Thanh Toán</Title>
                    <Table
                        columns={paymentColumns}
                        dataSource={paymentDetail.relatedPayments}
                        rowKey="paymentId"
                        pagination={false}
                        locale={{ emptyText: 'Chưa có giao dịch thanh toán' }}
                    />
                </Card>

                {/* Company Info */}
                <Card style={{ marginTop: 16, background: '#f9f9f9' }}>
                    <Title level={4}>Thông Tin Công Ty</Title>
                    <Text><strong>Công ty:</strong> Công Ty Du Lịch XYZ</Text><br />
                    <Text><strong>Địa chỉ:</strong> 123 Đường Lê Lợi, TP.HCM</Text><br />
                    <Text><strong>Hotline:</strong> 1900 1234</Text>
                </Card>

                {/* Actions */}
                <Space style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                    {paymentDetail.bookingStatus === 'DEPOSITED' && (
                        <Button
                            type="primary"
                            onClick={() => navigate(`/payment?bookingId=${paymentDetail.bookingId}&totalPrice=${paymentDetail.remainingAmount}`)}
                        >
                            Thanh toán tiếp
                        </Button>
                    )}
                    <Button icon={<PrinterOutlined />} onClick={handlePrint}>
                        In hóa đơn
                    </Button>
                </Space>
            </Card>
        </div>
    );
};

export default InvoiceDetail;