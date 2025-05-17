import React, { useState, useEffect } from "react";
import { MapPin, Search } from "lucide-react";
import { useAuth } from "../../Contexts/AuthContext";

const EmployeeTours = () => {
    const { token } = useAuth();
    const [tours, setTours] = useState([]);
    const [filteredTours, setFilteredTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");

    const fetchTours = async () => {
        try {
            if (!token) throw new Error("Chưa đăng nhập");
            const response = await fetch("https://be-travel-mitd.onrender.com/employee/tours", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("Không thể lấy danh sách tour");
            const data = await response.json();
            console.log("EmployeeTours - API response:", data);
            setTours(data.result || []);
            setFilteredTours(data.result || []);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTours();
    }, [token]);

    useEffect(() => {
        let result = tours;
        if (filter !== "all") {
            result = result.filter((t) => t.status.toLowerCase() === filter.toLowerCase());
        }
        if (search) {
            result = result.filter(
                (t) =>
                    t.tourId.toString().toLowerCase().includes(search.toLowerCase()) ||
                    (t.tourName && t.tourName.toLowerCase().includes(search.toLowerCase()))
            );
        }
        setFilteredTours(result);
    }, [filter, search, tours]);

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case "active":
                return "text-green-600";
            case "inactive":
                return "text-red-600";
            default:
                return "text-gray-600";
        }
    };

    if (loading) {
        return (
            <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Đang tải danh sách tour...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center text-red-500 bg-red-100 rounded-lg mx-auto max-w-screen-xl">
                <p className="font-semibold">Lỗi: {error}</p>
                <button
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={fetchTours}
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
                    <MapPin className="mr-2 text-blue-600" size={24} />
                    Danh sách Tour (Nhân viên)
                </h2>
                <div className="flex justify-between mb-4">
                    <div className="relative w-1/3">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Tìm kiếm mã tour, tên tour..."
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
                        <option value="active">Hoạt động</option>
                        <option value="inactive">Không hoạt động</option>
                    </select>
                </div>
                {filteredTours.length === 0 ? (
                    <p className="text-gray-500 text-center">Không có tour nào.</p>
                ) : (
                    <table className="w-full table-fixed border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-left">
                                <th className="p-3 border-b w-1/5">Mã Tour</th>
                                <th className="p-3 border-b w-1/5">Tên Tour</th>
                                <th className="p-3 border-b w-1/5">Ngày khởi hành</th>
                                <th className="p-3 border-b w-1/5">Trạng thái</th>
                                <th className="p-3 border-b w-1/5">Số khách</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTours.map((tour) => (
                                <tr key={tour.tourId} className="border-b hover:bg-gray-50">
                                    <td className="p-3 whitespace-nowrap text-left">{tour.tourId}</td>
                                    <td className="p-3 whitespace-nowrap text-left">{tour.tourName}</td>
                                    <td className="p-3 whitespace-nowrap text-left">
                                        {tour.departureDate ? new Date(tour.departureDate).toLocaleDateString("vi-VN") : "N/A"}
                                    </td>
                                    <td className={`p-3 whitespace-nowrap text-left ${getStatusColor(tour.status)}`}>
                                        {tour.status === "ACTIVE" ? "Hoạt động" : "Không hoạt động"}
                                    </td>
                                    <td className="p-3 whitespace-nowrap text-left">{tour.customerCount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default EmployeeTours;