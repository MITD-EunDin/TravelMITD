import React, { useState, useEffect } from "react";
import { UserCircle2 } from "lucide-react";
import { useAuth } from "../../Contexts/AuthContext";
import { FloatingInput } from "../FormLog/Login"; // Giả định đường dẫn từ LoginForm.jsx

const EmployeeProfile = () => {
    const { token } = useAuth();
    const [profile, setProfile] = useState({
        username: "",
        email: "",
        fullname: "",
        phone: "",
        address: "",
        dateOfBirth: "",
        citizenId: "",
        avatar: "",
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                if (!token) throw new Error("Chưa đăng nhập");
                const response = await fetch("http://localhost:8080/employee/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) throw new Error("Không thể lấy thông tin cá nhân");
                const data = await response.json();
                console.log("EmployeeProfile - API response:", data);
                setProfile(data.result || {});
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };
        fetchProfile();
    }, [token]);

    if (loading) {
        return (
            <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Đang tải thông tin cá nhân...</p>
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
            <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-md max-w-md mx-auto">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                    <UserCircle2 className="mr-2 text-blue-600" size={24} />
                    Hồ sơ cá nhân
                </h2>
                <div className="space-y-4">
                    <FloatingInput
                        label="Tên đăng nhập"
                        value={profile.username}
                        disabled
                    />
                    <FloatingInput
                        label="Email"
                        value={profile.email}
                        disabled
                    />
                    <FloatingInput
                        label="Họ và tên"
                        value={profile.fullname}
                        disabled
                    />
                    <FloatingInput
                        label="Số điện thoại"
                        value={profile.phone}
                        disabled
                    />
                    <FloatingInput
                        label="Địa chỉ"
                        value={profile.address}
                        disabled
                    />
                    <FloatingInput
                        label="Ngày sinh"
                        value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString("vi-VN") : ""}
                        disabled
                    />
                    <FloatingInput
                        label="CMND/CCCD"
                        value={profile.citizenId}
                        disabled
                    />
                    {profile.avatar && (
                        <div className="mt-4">
                            <img src={profile.avatar} alt="Avatar" className="w-24 h-24 rounded-full mx-auto" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmployeeProfile;