import React, { useState, useEffect } from "react";
import { Line, Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, BarElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import { CreditCard, Search, Users, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { getAllBookings, getEmployeeStats } from "../../../api/BookingApi";

ChartJS.register(ArcElement, BarElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

const Overview = () => {
    const [payments, setPayments] = useState([]);
    const [chuyenDi, setChuyenDi] = useState([]);
    const [nhanVien, setNhanVien] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [pageTrips, setPageTrips] = useState(0);
    const [pageEmployees, setPageEmployees] = useState(0);
    const [timeFilter, setTimeFilter] = useState("month");
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const pageSize = 5;

    const token = localStorage.getItem("token");

    // Lấy dữ liệu Payments
    const fetchPayments = async () => {
        try {
            if (!token) throw new Error("Chưa đăng nhập hoặc không có quyền admin");
            const response = await fetch("https://be-travel-mitd.onrender.com/payment/all", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("Không thể lấy dữ liệu thanh toán");
            const data = await response.json();
            setPayments(data.result || []);
        } catch (err) {
            throw err;
        }
    };

    // Lấy dữ liệu Chuyến đi
    const fetchTrips = async () => {
        try {
            const bookings = await getAllBookings();
            console.log('Bookings:', bookings); // Log để kiểm tra dữ liệu API
            // Nhóm bookings theo tourId
            const tourMap = bookings.reduce((acc, item) => {
                const tourId = item.tourId || item.tourName || `unknown-${item.id}`; // Fallback để tránh lỗi
                if (!acc[tourId]) {
                    acc[tourId] = {
                        id: tourId,
                        tour: item.tourName || "Unknown Tour",
                        soLuongDi: 0,
                        soLuongHuy: 0,
                        doanhThu: 0,
                    };
                }
                if (item.status === "PAID") {
                    acc[tourId].soLuongDi += item.quantity || 0;
                    acc[tourId].doanhThu += Number(item.paid) || 0;
                } else if (item.status === "FAILED") {
                    acc[tourId].soLuongHuy += item.quantity || 0;
                }
                return acc;
            }, {});
            // Chuyển tourMap thành mảng và gán rowStatus
            const mappedData = Object.values(tourMap).map(tour => ({
                ...tour,
                rowStatus: tour.soLuongDi > 0 && tour.soLuongHuy > 0 ? "mixed" :
                    tour.soLuongDi > 0 ? "onlyBooked" : "onlyCancelled",
            }));
            console.log('Aggregated Tours:', mappedData); // Log để kiểm tra dữ liệu tổng hợp
            setChuyenDi(mappedData);
        } catch (err) {
            throw err;
        }
    };

    // Lấy dữ liệu Nhân viên
    const fetchEmployees = async () => {
        try {
            const stats = await getEmployeeStats();
            const mappedData = stats.map((item) => ({
                id: item.id,
                tenNhanVien: item.tenNhanVien,
                soLuongTour: item.soLuongTour,
                doanhThu: Number(item.doanhThu),
                hoaHong: Number(item.hoaHong),
            }));
            setNhanVien(mappedData);
        } catch (err) {
            throw err;
        }
    };

    // Hàm tải dữ liệu
    const loadData = async () => {
        setLoading(true);
        try {
            await Promise.all([fetchPayments(), fetchTrips(), fetchEmployees()]);
        } catch (err) {
            setError(err.message || "Không thể tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    // Gọi loadData khi component mount
    useEffect(() => {
        loadData();
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

    // Lọc dữ liệu ở frontend
    const filteredChuyenDi = chuyenDi.filter(
        (t) =>
            t.tour.toLowerCase().includes(search.toLowerCase()) ||
            t.doanhThu.toString().includes(search)
    );
    const filteredNhanVien = nhanVien.filter(
        (n) =>
            n.tenNhanVien.toLowerCase().includes(search.toLowerCase()) ||
            n.doanhThu.toString().includes(search)
    );

    const paginatedChuyenDi = filteredChuyenDi.slice(pageTrips * pageSize, (pageTrips + 1) * pageSize);
    const paginatedNhanVien = filteredNhanVien.slice(pageEmployees * pageSize, (pageEmployees + 1) * pageSize);

    const totalChuyenDiPages = Math.ceil(filteredChuyenDi.length / pageSize);
    const totalNhanVienPages = Math.ceil(filteredNhanVien.length / pageSize);

    // Top 5 tour doanh thu cao nhất
    const topTours = [...chuyenDi]
        .sort((a, b) => b.doanhThu - a.doanhThu)
        .slice(0, 5);

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
                    onClick={loadData}
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
            <div className="space-y-6">
                {/* Line Chart (Full Width) */}
                <div className="bg-white p-6 rounded-lg shadow-md w-full">
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

                {/* Bar Chart và Pie Chart (Hai cột) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Bar chart */}
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

                    {/* Pie chart */}
                    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center">
                        <h3 className="text-lg font-bold mb-4">Tỷ lệ chuyến đi</h3>
                        <div className="w-[400px] h-[400px]">
                            <Pie
                                data={pieData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { position: "top" } },
                                }}
                            />
                        </div>
                    </div>
                </div>

            </div>

            {/* Tìm kiếm */}
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
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedChuyenDi.map((item, index) => (
                            <tr
                                key={index}
                                className={`border-b ${item.rowStatus === "onlyBooked" ? "bg-green-100 hover:bg-green-200" :
                                    item.rowStatus === "onlyCancelled" ? "bg-red-100 hover:bg-red-200" :
                                        "bg-yellow-100 hover:bg-yellow-200"
                                    }`}
                            >
                                <td className="p-3">{item.tour}</td>
                                <td className="p-3">{item.soLuongDi}</td>
                                <td className="p-3">{item.soLuongHuy}</td>
                                <td className="p-3">{item.doanhThu.toLocaleString()} đ</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="flex justify-center mt-4">
                    <button
                        onClick={() => setPageTrips((p) => Math.max(0, p - 1))}
                        className="px-4 py-2 border rounded-l-lg disabled:opacity-50"
                        disabled={pageTrips === 0}
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span className="px-4 py-2 border-t border-b">
                        Trang {pageTrips + 1} / {totalChuyenDiPages}
                    </span>
                    <button
                        onClick={() => setPageTrips((p) => p + 1)}
                        className="px-4 py-2 border rounded-r-lg disabled:opacity-50"
                        disabled={(pageTrips + 1) * pageSize >= filteredChuyenDi.length}
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
                        {paginatedNhanVien.map((item, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50">
                                <td className="p-3">{item.tenNhanVien}</td>
                                <td className="p-3">{item.soLuongTour}</td>
                                <td className="p-3">{item.doanhThu.toLocaleString()} đ</td>
                                <td className="p-3">{item.hoaHong.toLocaleString()} đ</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="flex justify-center mt-4">
                    <button
                        onClick={() => setPageEmployees((p) => Math.max(0, p - 1))}
                        className="px-4 py-2 border rounded-l-lg disabled:opacity-50"
                        disabled={pageEmployees === 0}
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span className="px-4 py-2 border-t border-b">
                        Trang {pageEmployees + 1} / {totalNhanVienPages}
                    </span>
                    <button
                        onClick={() => setPageEmployees((p) => p + 1)}
                        className="px-4 py-2 border rounded-r-lg disabled:opacity-50"
                        disabled={(pageEmployees + 1) * pageSize >= filteredNhanVien.length}
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
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