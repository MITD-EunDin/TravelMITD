import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Input, Select, Modal, message, Tag } from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import { getAllBookings, assignEmployee, assignEmployeeToTour, getEmployees } from "../../api/BookingApi";

const { Option } = Select;

const AdminOrders = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [tourFilter, setTourFilter] = useState("");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isTourAssignModalVisible, setIsTourAssignModalVisible] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [selectedTour, setSelectedTour] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const token = localStorage.getItem("token");

    const fetchData = async () => {
        try {
            setLoading(true);
            if (!token) {
                throw new Error("No token found");
            }
            const [bookingsData, employeesData] = await Promise.all([
                getAllBookings(token),
                getEmployees(token),
            ]);
            console.log('Bookings:', bookingsData);
            console.log('Employees:', employeesData);
            // Lọc bản ghi hợp lệ và chuẩn hóa status
            const validBookings = bookingsData
                .filter(booking => booking.maDatTour && booking.tourName && booking.customer)
                .map(booking => ({
                    ...booking,
                    status: booking.status.toLowerCase() // Chuẩn hóa status
                }));
            setBookings(validBookings);
            setEmployees(employeesData);
        } catch (error) {
            console.error("Error fetching data:", error);
            setError("Không thể tải dữ liệu. Vui lòng thử lại.");
            if (error.response?.status === 401) {
                navigate("/login");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token, navigate]);

    const handleRefresh = () => {
        setSearchText("");
        setStatusFilter("");
        setTourFilter("");
        setPage(1);
        fetchData(); // Tải lại dữ liệu
    };

    const handleSearch = (value) => {
        setSearchText(value);
        setPage(1);
    };

    const handleStatusFilter = (value) => {
        console.log('Selected status filter:', value); // Debug
        setStatusFilter(value);
        setPage(1);
    };

    const handleTourFilter = (value) => {
        console.log('Selected tour filter:', value);
        setTourFilter(value);
        setPage(1);
    };

    const showAssignModal = (booking) => {
        setSelectedBooking(booking);
        setSelectedEmployee(null);
        setIsModalVisible(true);
    };

    const showTourAssignModal = (tourId) => {
        setSelectedTour(tourId);
        setSelectedEmployee(null);
        setIsTourAssignModalVisible(true);
    };

    const handleAssignEmployee = async () => {
        if (!selectedBooking || !selectedEmployee) {
            message.error("Vui lòng chọn nhân viên!");
            return;
        }
        try {
            setLoading(true);
            await assignEmployee(selectedBooking.id, { employeeId: selectedEmployee }, token);
            setBookings((prev) =>
                prev.map((booking) =>
                    booking.id === selectedBooking.id
                        ? {
                            ...booking,
                            employeeId: selectedEmployee,
                            employee: employees.find((emp) => emp.id === selectedEmployee)?.fullname || "-",
                        }
                        : booking
                )
            );
            message.success("Phân công nhân viên thành công!");
            setIsModalVisible(false);
        } catch (error) {
            console.error("Error assigning employee:", error.response?.data || error.message);
            message.error(error.response?.data?.message || "Phân công nhân viên thất bại!");
            if (error.response?.status === 401) {
                navigate("/login");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAssignEmployeeToTour = async () => {
        if (!selectedTour || !selectedEmployee) {
            message.error("Vui lòng chọn nhân viên!");
            return;
        }
        try {
            setLoading(true);
            await assignEmployeeToTour(selectedTour, { employeeId: selectedEmployee }, token);
            setBookings((prev) =>
                prev.map((booking) =>
                    booking.tourId === selectedTour
                        ? {
                            ...booking,
                            employeeId: selectedEmployee,
                            employee: employees.find((emp) => emp.id === selectedEmployee)?.fullname || "-",
                        }
                        : booking
                )
            );
            message.success("Phân công nhân viên cho tất cả đơn của tour thành công!");
            setIsTourAssignModalVisible(false);
        } catch (error) {
            console.error("Error assigning employee to tour:", error.response?.data || error.message);
            message.error(error.response?.data?.message || "Phân công nhân viên thất bại!");
            if (error.response?.status === 401) {
                navigate("/login");
            }
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: "Mã đơn",
            dataIndex: "maDatTour",
            key: "maDatTour",
            filteredValue: [searchText],
            onFilter: (value, record) => {
                const searchLower = value.toLowerCase();
                return (
                    (record.maDatTour?.toLowerCase() || "").includes(searchLower) ||
                    (record.tourName?.toLowerCase() || "").includes(searchLower) ||
                    (record.customer?.toLowerCase() || "").includes(searchLower)
                );
            },
        },
        { title: "Tên tour", dataIndex: "tourName", key: "tourName" },
        { title: "Khách hàng", dataIndex: "customer", key: "customer" },
        { title: "Ngày đặt", dataIndex: "bookingDate", key: "bookingDate" },
        { title: "Ngày khởi hành", dataIndex: "departureDate", key: "departureDate" },
        { title: "Số lượng", dataIndex: "quantity", key: "quantity" },
        {
            title: "Tổng tiền",
            dataIndex: "total",
            key: "total",
            render: (total) => total?.toLocaleString() + " VND" || "-",
        },
        {
            title: "Đã thanh toán",
            dataIndex: "paid",
            key: "paid",
            render: (paid) => paid?.toLocaleString() + " VND" || "-",
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            filters: [
                { text: "Tất cả", value: "" },
                { text: "Chưa thanh toán", value: "pending" },
                { text: "Đã đặt cọc", value: "deposited" },
                { text: "Đã thanh toán", value: "paid" },
            ],
            filteredValue: statusFilter ? [statusFilter] : null,
            onFilter: (value, record) => value === "" || record.status.toLowerCase() === value,
            render: (status) => {
                switch (status.toLowerCase()) {
                    case "paid":
                        return <Tag color="success">Đã thanh toán</Tag>;
                    case "deposited":
                        return <Tag color="processing">Đã đặt cọc</Tag>;
                    case "pending":
                    default:
                        return <Tag color="warning">Chưa thanh toán</Tag>;
                }
            },
        },
        {
            title: "Nhân viên chăm sóc",
            dataIndex: "employee",
            key: "employee",
            render: (employee) => employee || "-",
        },
        {
            title: "Hành động",
            key: "action",
            render: (_, record) => (
                <div className="flex gap-2">
                    <Button onClick={() => navigate(`/admin/orders/${record.id}`, { state: { booking: record } })}>Xem chi tiết</Button>
                    <Button onClick={() => showAssignModal(record)}>Phân công</Button>
                </div>
            ),
        },
    ];

    const uniqueTours = [...new Set(bookings.map((booking) => booking.tourId))];

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Quản lý Đơn hàng</h1>
            {error ? (
                <p className="text-red-500 text-center">{error}</p>
            ) : bookings.length === 0 ? (
                <p className="text-center">Không có đơn đặt tour nào.</p>
            ) : (
                <>
                    <div className="mb-4 flex gap-4">
                        <Input
                            placeholder="Tìm kiếm mã đơn, tên tour hoặc khách hàng"
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={(e) => handleSearch(e.target.value)}
                            style={{ width: 300 }}
                        />
                        <Select
                            placeholder="Lọc theo trạng thái"
                            value={statusFilter}
                            onChange={handleStatusFilter}
                            style={{ width: 200 }}
                            allowClear
                        >
                            <Option value="">Tất cả</Option>
                            <Option value="pending">Chưa thanh toán</Option>
                            <Option value="deposited">Đã đặt cọc</Option>
                            <Option value="paid">Đã thanh toán</Option>
                        </Select>
                        <Select
                            placeholder="Lọc theo tour"
                            value={tourFilter}
                            onChange={handleTourFilter}
                            style={{ width: 200 }}
                            allowClear
                        >
                            {uniqueTours.map((tourId) => (
                                <Option key={tourId} value={tourId}>
                                    {bookings.find((b) => b.tourId === tourId)?.tourName || "Unknown Tour"}
                                </Option>
                            ))}
                        </Select>
                        <Button
                            type="primary"
                            onClick={() => showTourAssignModal(tourFilter)}
                            disabled={!tourFilter}
                        >
                            Phân công hàng loạt
                        </Button>
                        <Button
                            type="default"
                            icon={<ReloadOutlined />}
                            onClick={handleRefresh}
                        >
                            Làm mới
                        </Button>
                    </div>
                    <Table
                        columns={columns}
                        dataSource={bookings.filter((booking) => !tourFilter || booking.tourId === tourFilter)}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            current: page,
                            pageSize: pageSize,
                            total: bookings.length,
                            onChange: (page, pageSize) => {
                                setPage(page);
                                setPageSize(pageSize);
                            },
                        }}
                    />
                    <Modal
                        title="Phân công nhân viên chăm sóc khách hàng"
                        open={isModalVisible}
                        onOk={handleAssignEmployee}
                        onCancel={() => setIsModalVisible(false)}
                        okText="Xác nhận"
                        cancelText="Hủy"
                    >
                        <Select
                            placeholder="Chọn nhân viên"
                            value={selectedEmployee}
                            onChange={setSelectedEmployee}
                            style={{ width: "100%" }}
                        >
                            {employees.map((employee) => (
                                <Option key={employee.id} value={employee.id}>
                                    {employee.fullname} ({employee.username})
                                </Option>
                            ))}
                        </Select>
                    </Modal>
                    <Modal
                        title="Phân công nhân viên cho tất cả đơn của tour"
                        open={isTourAssignModalVisible}
                        onOk={handleAssignEmployeeToTour}
                        onCancel={() => setIsTourAssignModalVisible(false)}
                        okText="Xác nhận"
                        cancelText="Hủy"
                    >
                        <Select
                            placeholder="Chọn nhân viên"
                            value={selectedEmployee}
                            onChange={setSelectedEmployee}
                            style={{ width: "100%" }}
                        >
                            {employees.map((employee) => (
                                <Option key={employee.id} value={employee.id}>
                                    {employee.fullname} ({employee.username})
                                </Option>
                            ))}
                        </Select>
                    </Modal>
                </>
            )}
        </div>
    );
};

export default AdminOrders;