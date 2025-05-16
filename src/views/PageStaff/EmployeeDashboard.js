import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import { CreditCard, MapPin, DollarSign } from "lucide-react";
import { useAuth } from "../../Contexts/AuthContext";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const EmployeeDashboard = () => {
    const { token } = useAuth();
    const [performance, setPerformance] = useState({ tours: 0, revenue: 0, commission: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPerformance = async () => {
            try {
                if (!token) throw new Error("Chưa đăng nhập");
                const response = await fetch("http://localhost:8080/employee/performance", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) throw new Error("Không thể lấy số liệu hiệu suất");
                const data = await response.json();
                console.log("EmployeeDashboard - API response:", data);
                setPerformance(data.result || { tours: 0, revenue: 0, commission: 0 });
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };
        fetchPerformance();
    }, [token]);

    const barData = {
        labels: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5"], // Giả lập, thay bằng dữ liệu thực
        datasets: [
            {
                label: "Doanh thu (VND)",
                data: [5000000, 3000000, 4000000, 6000000, 2000000], // Giả lập
                backgroundColor: "rgba(59, 130, 246, 0.5)",
                borderColor: "rgba(59, 130, 246, 1)",
                borderWidth: 1,
            },
        ],
    };

    if (loading) {
        return (
            <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Đang tải...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center text-red-500 bg-red-100 rounded-lg mx-auto max-w-screen-xl">
                <p className="font-semibold">Lỗi: {error}</p>
                <button
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={() => window.location.reload()}
                >
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <h2 className="text-xl font-bold mb-4">Tổng quan cá nhân</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card title="Số tour" value={performance.tours} icon={<MapPin size={24} className="text-blue-600" />} />
                <Card title="Doanh thu" value={`${performance.revenue.toLocaleString()} VND`} icon={<CreditCard size={24} className="text-green-600" />} />
                <Card title="Hoa hồng" value={`${performance.commission.toLocaleString()} VND`} icon={<DollarSign size={24} className="text-yellow-600" />} />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-bold mb-4">Doanh thu theo tháng</h3>
                <Bar data={barData} options={{ responsive: true, plugins: { legend: { position: "top" } } }} />
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

export default EmployeeDashboard;