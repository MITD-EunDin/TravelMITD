import React, { useState, useEffect } from "react";
import { Line, Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, BarElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import { CreditCard, Search, Users, MapPin, ChevronLeft, ChevronRight } from "lucide-react";

ChartJS.register(ArcElement, BarElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

const Overview = () => {
    const [payments, setPayments] = useState([]);
    const [chuyenDi, setChuyenDi] = useState([
        {
            tour: "Hà Nội-SaPa 4 ngày 3 đêm",
            soLuongDi: 100,
            soLuongHuy: 5,
            doanhThu: 100000000,
            status: "PAID",
        },
        {
            tour: "Khám phá xứ sở kim chi 4 ngày 3 đêm",
            soLuongDi: 80,
            soLuongHuy: 10,
            doanhThu: 200000000,
            status: "PENDING",
        },
        {
            tour: "Đà Nẵng-Hội An 3 ngày 2 đêm",
            soLuongDi: 120,
            soLuongHuy: 8,
            doanhThu: 150000000,
            status: "PAID",
        },
        {
            tour: "Phú Quốc 4 ngày 3 đêm",
            soLuongDi: 90,
            soLuongHuy: 12,
            doanhThu: 180000000,
            status: "PAID",
        },
        {
            tour: "Nhật Bản 5 ngày 4 đêm",
            soLuongDi: 60,
            soLuongHuy: 3,
            doanhThu: 250000000,
            status: "PAID",
        },
        {
            tour: "Hà Giang 3 ngày 2 đêm",
            soLuongDi: 70,
            soLuongHuy: 6,
            doanhThu: 90000000,
            status: "FAILED",
        },
    ]);
    const [nhanVien, setNhanVien] = useState([
        {
            tenNhanVien: "Nguyễn Thị Trinh",
            soLuongTour: 5,
            doanhThu: 2000000,
            hoaHong: 100000,
        },
        {
            tenNhanVien: "Tôn Văn Diện",
            soLuongTour: 0,
            doanhThu: 0,
            hoaHong: 0,
        },
        {
            tenNhanVien: "Đỗ Mạnh Cường",
            soLuongTour: 0,
            doanhThu: 0,
            hoaHong: 0,
        },
    ]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [timeFilter, setTimeFilter] = useState("month");
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const pageSize = 5;
    const token = localStorage.getItem("token");

    // Lấy dữ liệu từ API
    const fetchPayments = async () => {
        try {
            if (!token) throw new Error("Chưa đăng nhập hoặc không có quyền admin");
            const response = await fetch("http://localhost:8080/payment/all", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("Không thể lấy dữ liệu thanh toán");
            const data = await response.json();
            setPayments(data.result || []);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    // Tính số liệu tổng quan
    const totalRevenue = payments.reduce((sum, p) => sum + (p.status === "PAID" ? p.amount : 0), 0);
    const totalTrips = chuyenDi.reduce((sum, t) => sum + t.soLuongDi, 0);
    const totalCancellations = chuyenDi.reduce((sum, t) => sum + t.soLuongHuy, 0);
    const completionRate = totalTrips ? ((totalTrips / (totalTrips + totalCancellations)) * 100).toFixed(1) : 0;

    // Nhóm dữ liệu doanh thu theo tháng/quý/năm
    const revenueData = payments
        .filter((p) => p.status === "PAID")
        .reduce((acc, p) => {
            const date = new Date(p.paymentDate);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const quarter = Math.floor((month - 1) / 3) + 1;

            if (timeFilter === "month" && year === selectedYear) {
                const key = `${month}/${year}`;
                acc[key] = (acc[key] || 0) + p.amount;
            } else if (timeFilter === "quarter" && year === selectedYear) {
                const key = `Q${quarter}/${year}`;
                acc[key] = (acc[key] || 0) + p.amount;
            } else if (timeFilter === "year") {
                const key = `${year}`;
                acc[key] = (acc[key] || 0) + p.amount;
            }
            return acc;
        }, {});

    // Chuẩn bị dữ liệu cho biểu đồ đường
    const lineData = {
        labels:
            timeFilter === "month"
                ? Array.from({ length: 12 }, (_, i) => `${i + 1}/${selectedYear}`)
                : timeFilter === "quarter"
                    ? [`Q1/${selectedYear}`, `Q2/${selectedYear}`, `Q3/${selectedYear}`, `Q4/${selectedYear}`]
                    : Array.from({ length: 6 }, (_, i) => `${selectedYear - 5 + i}`),
        datasets: [
            {
                label: "Doanh thu (VND)",
                data:
                    timeFilter === "month"
                        ? Array.from({ length: 12 }, (_, i) => revenueData[`${i + 1}/${selectedYear}`] || 0)
                        : timeFilter === "quarter"
                            ? [1, 2, 3, 4].map((q) => revenueData[`Q${q}/${selectedYear}`] || 0)
                            : Array.from({ length: 6 }, (_, i) => revenueData[`${selectedYear - 5 + i}`] || 0),
                borderColor: "rgba(59, 130, 246, 1)",
                backgroundColor: "rgba(59, 130, 246, 0.2)",
                fill: true,
                tension: 0.4,
            },
        ],
    };

    // Lọc và tìm kiếm
    const filteredChuyenDi = chuyenDi.filter(
        (t) =>
            (filter === "all" || t.status.toLowerCase() === filter.toLowerCase()) &&
            (t.tour.toLowerCase().includes(search.toLowerCase()) || t.doanhThu.toString().includes(search))
    );

    const filteredNhanVien = nhanVien.filter(
        (n) =>
            n.tenNhanVien.toLowerCase().includes(search.toLowerCase()) ||
            n.doanhThu.toString().includes(search)
    );

    // Phân trang cho bảng Chuyến đi
    const paginatedChuyenDi = filteredChuyenDi.slice(page * pageSize, (page + 1) * pageSize);

    // Top 5 tour doanh thu cao nhất
    const topTours = [...chuyenDi]
        .sort((a, b) => b.doanhThu - a.doanhThu)
        .slice(0, 5);

    // Dữ liệu biểu đồ cột (top 5 tour)
    const barData = {
        labels: topTours.map((t) => t.tour),
        datasets: [
            {
                label: "Doanh thu (VND)",
                data: topTours.map((t) => t.doanhThu),
                backgroundColor: "rgba(59, 130, 246, 0.5)",
                borderColor: "rgba(59, 130, 246, 1)",
                borderWidth: 1,
            },
        ],
    };

    // Dữ liệu biểu đồ tròn
    const pieData = {
        labels: ["Thành công", "Hủy"],
        datasets: [
            {
                data: [totalTrips, totalCancellations],
                backgroundColor: ["rgba(34, 197, 94, 0.5)", "rgba(239, 68, 68, 0.5)"],
                borderColor: ["rgba(34, 197, 94, 1)", "rgba(239, 68, 68, 1)"],
                borderWidth: 1,
            },
        ],
    };

    // Danh sách năm cho dropdown
    const years = Array.from({ length: 6 }, (_, i) => selectedYear - i);

    if (loading) {
        return (
            <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
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
        <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
            {/* Logo */}
            <div className="mb-6">
                <img src="/Frame-3.png" alt="Logo" className="h-16 mx-auto" />
            </div>

            {/* Card tổng quan */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card title="Tổng doanh thu" value={`${totalRevenue.toLocaleString()} VND`} icon={<CreditCard size={24} className="text-blue-600" />} />
                <Card title="Tổng chuyến đi" value={totalTrips} icon={<MapPin size={24} className="text-green-600" />} />
                <Card title="Tổng chuyến hủy" value={totalCancellations} icon={<MapPin size={24} className="text-red-600" />} />
                <Card title="Tỷ lệ hoàn thành" value={`${completionRate}%`} icon={<Users size={24} className="text-yellow-600" />} />
            </div>

            {/* Biểu đồ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Biểu đồ đường doanh thu theo thời gian */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">Doanh thu theo thời gian</h3>
                        <div className="flex space-x-2">
                            <select
                                value={timeFilter}
                                onChange={(e) => setTimeFilter(e.target.value)}
                                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="month">Theo tháng</option>
                                <option value="quarter">Theo quý</option>
                                <option value="year">Theo năm</option>
                            </select>
                            {(timeFilter === "month" || timeFilter === "quarter") && (
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {years.map((year) => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>
                    <Line
                        data={lineData}
                        options={{
                            responsive: true,
                            plugins: { legend: { position: "top" } },
                            scales: {
                                y: { beginAtZero: true, title: { display: true, text: "Doanh thu (VND)" } },
                                x: { title: { display: true, text: timeFilter === "month" ? "Tháng" : timeFilter === "quarter" ? "Quý" : "Năm" } },
                            },
                        }}
                    />
                </div>

                {/* Biểu đồ cột top 5 tour */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-bold mb-4">Top 5 tour doanh thu cao nhất</h3>
                    <Bar
                        data={barData}
                        options={{
                            responsive: true,
                            plugins: { legend: { position: "top" } },
                            scales: {
                                x: { ticks: { autoSkip: false, maxRotation: 45, minRotation: 45 } },
                                y: { beginAtZero: true, title: { display: true, text: "Doanh thu (VND)" } },
                            },
                        }}
                    />
                </div>

                {/* Biểu đồ tròn tỷ lệ chuyến đi */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-bold mb-4">Tỷ lệ chuyến đi</h3>
                    <Pie data={pieData} options={{ responsive: true, plugins: { legend: { position: "top" } } }} />
                </div>
            </div>

            {/* Bộ lọc và tìm kiếm */}
            <div className="flex justify-between items-center mb-4">
                <div className="relative w-1/3">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm kiếm tour, nhân viên..."
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

            {/* Bảng Chuyến đi */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-bold mb-4">Chuyến đi</h3>
                <table className="w-full table-fixed border-collapse">
                    <thead>
                        <tr className="bg-gray-100 text-left">
                            <th className="p-3 border-b w-2/5">Thông tin tour</th>
                            <th className="p-3 border-b w-1/5">SL đã đi</th>
                            <th className="p-3 border-b w-1/5">SL hủy</th>
                            <th className="p-3 border-b w-1/5">Doanh thu</th>
                            <th className="p-3 border-b w-1/5">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedChuyenDi.map((item, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50">
                                <td className="p-3">{item.tour}</td>
                                <td className="p-3">{item.soLuongDi}</td>
                                <td className="p-3">{item.soLuongHuy}</td>
                                <td className="p-3">{item.doanhThu.toLocaleString()} đ</td>
                                <td className={`p-3 ${item.status === "PAID" ? "text-green-600" : item.status === "PENDING" ? "text-yellow-500" : "text-red-600"}`}>
                                    {item.status === "PAID" ? "Thành công" : item.status === "PENDING" ? "Đang chờ" : "Thất bại"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* Phân trang */}
                <div className="flex justify-center mt-4">
                    <button
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        className="px-4 py-2 border rounded-l-lg disabled:opacity-50"
                        disabled={page === 0}
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span className="px-4 py-2 border-t border-b">
                        Trang {page + 1} / {Math.ceil(filteredChuyenDi.length / pageSize)}
                    </span>
                    <button
                        onClick={() => setPage((p) => p + 1)}
                        className="px-4 py-2 border rounded-r-lg disabled:opacity-50"
                        disabled={(page + 1) * pageSize >= filteredChuyenDi.length}
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Bảng Nhân viên */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-bold mb-4">Nhân viên</h3>
                <table className="w-full table-fixed border-collapse">
                    <thead>
                        <tr className="bg-gray-100 text-left">
                            <th className="p-3 border-b w-2/5">Nhân viên</th>
                            <th className="p-3 border-b w-1/5">SL tour</th>
                            <th className="p-3 border-b w-1/5">Doanh thu</th>
                            <th className="p-3 border-b w-1/5">Hoa hồng</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredNhanVien.map((item, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50">
                                <td className="p-3">{item.tenNhanVien}</td>
                                <td className="p-3">{item.soLuongTour}</td>
                                <td className="p-3">{item.doanhThu.toLocaleString()} đ</td>
                                <td className="p-3">{item.hoaHong.toLocaleString()} đ</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const Card = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
        {icon}
        <div>
            <h4 className="text-lg font-semibold text-gray-800">{title}</h4>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

export default Overview;