import React, { useState, useEffect } from "react";
import { UserCircle2, Mail, Phone, MapPin, Calendar, IdCard } from "lucide-react";
import { useAuth } from "../../Contexts/AuthContext";

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
                const response = await fetch("https://be-travel-mitd.onrender.com/employee/profile", {
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
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center animate-pulse">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 text-lg">Đang tải thông tin cá nhân...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
                    <p className="text-red-500 font-semibold text-lg mb-4">Lỗi: {error}</p>
                    <button
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
                        onClick={() => window.location.reload()}
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex flex-col items-center mb-8">
                        {profile.avatar ? (
                            <img
                                src={profile.avatar}
                                alt="Avatar"
                                className="w-32 h-32 rounded-full object-cover border-4 border-blue-100 shadow-md"
                            />
                        ) : (
                            <UserCircle2 className="w-32 h-32 text-gray-300" />
                        )}
                        <h3 className="mt-4 text-2xl font-semibold text-gray-800">{profile.fullname || "Chưa có tên"}</h3>
                        <p className="text-gray-500">{profile.email || "Chưa có email"}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ProfileField
                            icon={<UserCircle2 className="text-blue-500" size={20} />}
                            label="Tên đăng nhập"
                            value={profile.username || "Chưa có"}
                        />
                        <ProfileField
                            icon={<Mail className="text-blue-500" size={20} />}
                            label="Email"
                            value={profile.email || "Chưa có"}
                        />
                        {/* <ProfileField
                            icon={<UserCircle2 className="text-blue-500" size={20} />}
                            label="Họ và tên"
                            value={profile.fullname || "Chưa có"}
                        /> */}
                        <ProfileField
                            icon={<Phone className="text-blue-500" size={20} />}
                            label="Số điện thoại"
                            value={profile.phone || "Chưa có"}
                        />
                        <ProfileField
                            icon={<MapPin className="text-blue-500" size={20} />}
                            label="Địa chỉ"
                            value={profile.address || "Chưa có"}
                        />
                        <ProfileField
                            icon={<Calendar className="text-blue-500" size={20} />}
                            label="Ngày sinh"
                            value={
                                profile.dateOfBirth
                                    ? new Date(profile.dateOfBirth).toLocaleDateString("vi-VN")
                                    : "Chưa có"
                            }
                        />
                        <ProfileField
                            icon={<IdCard className="text-blue-500" size={20} />}
                            label="CMND/CCCD"
                            value={profile.citizenId || "Chưa có"}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProfileField = ({ icon, label, value }) => (
    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
        {icon}
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-lg font-medium text-gray-800">{value}</p>
        </div>
    </div>
);

export default EmployeeProfile;