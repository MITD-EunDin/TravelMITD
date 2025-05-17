import { memo, useState, useEffect } from "react";
import { UserCircle2, Mail, Phone, MapPin, Calendar, IdCard } from "lucide-react";
import { Button, message, Spin } from "antd";
import { getMyInfo, updateUser } from "../../../api/Api";
import dayjs from "dayjs";

// Component UserProfile để hiển thị và chỉnh sửa thông tin người dùng
const UserProfile = () => {
    const [userInfo, setUserInfo] = useState({
        username: "",
        email: "",
        fullname: "",
        phone: "",
        address: "",
        dateOfBirth: "",
        citizenId: "",
        avatar: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null); // Lưu URL preview ảnh
    const [isEditing, setIsEditing] = useState(false); // Kiểm soát chế độ chỉnh sửa

    const token = localStorage.getItem("token");

    // Lấy thông tin người dùng từ API
    useEffect(() => {
        const fetchUserInfo = async () => {
            if (!token) {
                setError("Vui lòng đăng nhập để xem thông tin.");
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const data = await getMyInfo(token);
                console.log("UserProfile - API response:", JSON.stringify(data, null, 2));
                if (!data || !data.id) {
                    throw new Error("Không tìm thấy thông tin người dùng");
                }
                setUserInfo(data);
            } catch (error) {
                console.error("Lỗi khi lấy thông tin người dùng:", error);
                setError(error.message || "Không thể lấy thông tin người dùng. Vui lòng thử lại.");
            } finally {
                setLoading(false);
            }
        };
        fetchUserInfo();
    }, [token]);

    // Xử lý chọn file ảnh
    const handleImageChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    // Xử lý upload ảnh lên Cloudinary
    const handleUpload = async () => {
        if (!file) {
            message.warning("Vui lòng chọn một ảnh trước khi upload.");
            return null;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "avatar");
        formData.append("folder", "avatars");

        try {
            const response = await fetch(
                "https://api.cloudinary.com/v1_1/duydoyrpb/image/upload",
                {
                    method: "POST",
                    body: formData,
                }
            );
            const data = await response.json();
            console.log("Cloudinary response:", JSON.stringify(data, null, 2));

            if (data.secure_url) {
                console.log("Upload thành công, secure_url:", data.secure_url);
                return data.secure_url;
            } else {
                throw new Error(data.error?.message || "Upload ảnh thất bại");
            }
        } catch (error) {
            console.error("Lỗi khi upload ảnh:", error);
            message.error(`Upload ảnh thất bại: ${error.message}`);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Xử lý submit chỉnh sửa thông tin
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) {
            message.error("Vui lòng đăng nhập để cập nhật thông tin.");
            setLoading(false);
            return;
        }

        if (!userInfo.id) {
            message.error("Không tìm thấy ID người dùng. Vui lòng thử lại.");
            setLoading(false);
            return;
        }

        const formData = new FormData(e.target);
        const values = Object.fromEntries(formData.entries());
        const payload = {
            ...values,
            dateOfBirth: values.dateOfBirth ? dayjs(values.dateOfBirth).format("YYYY-MM-DD") : null,
            role: userInfo.roles ? userInfo.roles[0] : "USER",
        };

        setLoading(true);
        try {
            let avatarUrl = userInfo.avatar;
            if (file) {
                console.log("Đang upload ảnh lên Cloudinary...");
                avatarUrl = await handleUpload();
                if (!avatarUrl) {
                    setLoading(false);
                    return;
                }
            }

            payload.avatar = avatarUrl;
            console.log("Payload gửi đến updateUser:", JSON.stringify(payload, null, 2));

            const updatedUser = await updateUser(userInfo.id, payload, token);
            console.log("Backend update response:", JSON.stringify(updatedUser, null, 2));
            setUserInfo(updatedUser);
            message.success("Cập nhật thông tin thành công!");
            setFile(null);
            setPreviewUrl(null);
            setIsEditing(false);
        } catch (error) {
            console.error("Lỗi khi cập nhật thông tin:", error);
            if (error.response?.status === 401) {
                message.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
                localStorage.removeItem("token");
                window.location.href = "/login";
            } else {
                message.error(`Cập nhật thông tin thất bại: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    // Xử lý hủy chỉnh sửa
    const handleCancel = () => {
        setIsEditing(false);
        setFile(null);
        setPreviewUrl(null);
    };

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
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
                        onClick={() => window.location.reload()}
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen ">
            <div className=" mx-auto">
                <div className="bg-white rounded-xl  p-8 hover:shadow-xl ">
                    {isEditing ? (
                        // Chế độ chỉnh sửa
                        <form onSubmit={handleSubmit}>
                            <div className="flex flex-col items-center mb-8">
                                {previewUrl || userInfo.avatar ? (
                                    <img
                                        src={previewUrl || userInfo.avatar}
                                        alt="Avatar"
                                        className="w-32 h-32 rounded-full object-cover border-4 border-blue-100 shadow-md"
                                    />
                                ) : (
                                    <UserCircle2 className="w-32 h-32 text-gray-300" />
                                )}
                                <label className="inline-block mt-4 px-4 py-2 text-blue-800 text-md rounded cursor-pointer hover:opacity-60 transition duration-200">
                                    Thay đổi ảnh đại diện
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ProfileFieldEdit
                                    label="Tên đăng nhập"
                                    name="username"
                                    value={userInfo.username}
                                    readOnly
                                />
                                <ProfileFieldEdit
                                    label="Email"
                                    name="email"
                                    value={userInfo.email}
                                    readOnly
                                />
                                <ProfileFieldEdit
                                    label="Họ và tên"
                                    name="fullname"
                                    value={userInfo.fullname}
                                />
                                <ProfileFieldEdit
                                    label="Số điện thoại"
                                    name="phone"
                                    value={userInfo.phone}
                                />
                                <ProfileFieldEdit
                                    label="Địa chỉ"
                                    name="address"
                                    value={userInfo.address}
                                />
                                <ProfileFieldEdit
                                    label="Ngày sinh"
                                    name="dateOfBirth"
                                    value={userInfo.dateOfBirth ? new Date(userInfo.dateOfBirth).toISOString().split('T')[0] : ""}
                                    type="date"
                                />
                                <ProfileFieldEdit
                                    label="CMND/CCCD"
                                    name="citizenId"
                                    value={userInfo.citizenId}
                                />
                            </div>
                            <div className="mt-6 flex justify-center gap-4">
                                <button
                                    type="submit"
                                    className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                                    disabled={loading}
                                >
                                    {loading ? "Đang lưu..." : "Lưu thay đổi"}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-all duration-300"
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    ) : (
                        // Chế độ xem
                        <div>
                            <div className="flex flex-col items-center mb-8">
                                {userInfo.avatar ? (
                                    <img
                                        src={userInfo.avatar}
                                        alt="Avatar"
                                        className="w-32 h-32 rounded-full object-cover border-4 border-blue-100 shadow-md"
                                    />
                                ) : (
                                    <UserCircle2 className="w-32 h-32 text-gray-300" />
                                )}
                                <h3 className="mt-4 text-2xl font-semibold text-gray-800">{userInfo.fullname || "Chưa có tên"}</h3>
                                <p className="text-gray-500">{userInfo.email || "Chưa có email"}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ProfileField
                                    icon={<UserCircle2 className="text-blue-500" size={20} />}
                                    label="Tên đăng nhập"
                                    value={userInfo.username || "Chưa có"}
                                />
                                <ProfileField
                                    icon={<Mail className="text-blue-500" size={20} />}
                                    label="Email"
                                    value={userInfo.email || "Chưa có"}
                                />
                                <ProfileField
                                    icon={<UserCircle2 className="text-blue-500" size={20} />}
                                    label="Họ và tên"
                                    value={userInfo.fullname || "Chưa có"}
                                />
                                <ProfileField
                                    icon={<Phone className="text-blue-500" size={20} />}
                                    label="Số điện thoại"
                                    value={userInfo.phone || "Chưa có"}
                                />
                                <ProfileField
                                    icon={<MapPin className="text-blue-500" size={20} />}
                                    label="Địa chỉ"
                                    value={userInfo.address || "Chưa có"}
                                />
                                <ProfileField
                                    icon={<Calendar className="text-blue-500" size={20} />}
                                    label="Ngày sinh"
                                    value={
                                        userInfo.dateOfBirth
                                            ? new Date(userInfo.dateOfBirth).toLocaleDateString("vi-VN")
                                            : "Chưa có"
                                    }
                                />
                                <ProfileField
                                    icon={<IdCard className="text-blue-500" size={20} />}
                                    label="CMND/CCCD"
                                    value={userInfo.citizenId || "Chưa có"}
                                />
                            </div>
                            <div className="mt-6 flex justify-center">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
                                >
                                    Chỉnh sửa hồ sơ
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Component hiển thị thông tin trong chế độ xem
const ProfileField = ({ icon, label, value }) => (
    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
        {icon}
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-lg font-medium text-gray-800">{value}</p>
        </div>
    </div>
);

// Component chỉnh sửa thông tin trong chế độ chỉnh sửa
const ProfileFieldEdit = ({ label, name, value, type = "text", readOnly = false }) => (
    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
        <div className="w-full">
            <label className="text-sm text-gray-500">{label}</label>
            <input
                type={type}
                name={name}
                defaultValue={value}
                readOnly={readOnly}
                className={`w-full mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${readOnly ? "bg-gray-200 cursor-not-allowed" : ""
                    }`}
            />
        </div>
    </div>
);

export default memo(UserProfile);