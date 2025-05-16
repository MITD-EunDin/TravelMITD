import { memo, useState, useEffect } from "react";
import { User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Form, Input, Button, DatePicker, Spin, message } from "antd";
import { getMyInfo, updateUser } from "../../../api/Api";
import dayjs from "dayjs";
import './userprofile.scss';

// Component UserProfile để hiển thị và chỉnh sửa thông tin người dùng
const UserProfile = () => {
    const [userInfo, setUserInfo] = useState({});
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null); // Lưu URL preview ảnh
    const [isEditing, setIsEditing] = useState(false); // Kiểm soát chế độ chỉnh sửa
    const [form] = Form.useForm();
    const token = localStorage.getItem("token");

    // Lấy thông tin người dùng từ API
    useEffect(() => {
        const fetchUserInfo = async () => {
            if (!token) {
                message.error("Vui lòng đăng nhập để xem thông tin.");
                console.log("Thiếu token trong useEffect");
                return;
            }
            try {
                setLoading(true);
                const data = await getMyInfo(token);
                console.log("Dữ liệu người dùng từ /users/myInfo:", JSON.stringify(data, null, 2));
                if (!data || !data.id) {
                    throw new Error("Không tìm thấy ID người dùng trong dữ liệu trả về");
                }
                setUserInfo(data);
                // Điền dữ liệu vào form
                form.setFieldsValue({
                    fullname: data.fullname,
                    email: data.email,
                    phone: data.phone,
                    address: data.address,
                    citizenId: data.citizenId,
                    dateOfBirth: data.dateOfBirth ? dayjs(data.dateOfBirth) : null,
                });
            } catch (error) {
                console.error("Lỗi khi lấy thông tin người dùng:", error);
                message.error("Không thể lấy thông tin người dùng. Vui lòng thử lại.");
            } finally {
                setLoading(false);
            }
        };
        fetchUserInfo();
    }, [token, form]);

    // Xử lý chọn file ảnh
    const handleImageChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile)); // Cập nhật URL preview
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
        formData.append("upload_preset", "avatar"); // Preset chính
        formData.append("folder", "avatars"); // Lưu vào thư mục avatars

        try {
            // Debug: Log formData entries
            console.log("FormData entries:");
            for (let pair of formData.entries()) {
                console.log(`${pair[0]}: ${pair[1]}`);
            }

            // Upload ảnh lên Cloudinary
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

    // Xử lý submit form
    const onFinish = async (values) => {
        console.log("Hàm onFinish được gọi với values:", JSON.stringify(values, null, 2));
        if (!token) {
            message.error("Vui lòng đăng nhập để cập nhật thông tin.");
            console.log("Thiếu token trong onFinish");
            return;
        }

        if (!userInfo.id) {
            message.error("Không tìm thấy ID người dùng. Vui lòng thử lại.");
            console.log("Thiếu userInfo.id trong onFinish");
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            let avatarUrl = userInfo.avatar;
            if (file) {
                console.log("Đang upload ảnh lên Cloudinary...");
                avatarUrl = await handleUpload();
                if (!avatarUrl) {
                    console.log("Upload ảnh thất bại, dừng xử lý");
                    setLoading(false);
                    return; // Dừng nếu upload ảnh thất bại
                }
            }

            // Chuẩn bị payload cho API
            const payload = {
                ...values,
                dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format("YYYY-MM-DD") : null,
                avatar: avatarUrl,
                role: userInfo.roles ? userInfo.roles[0] : "USER", // Thêm role để khớp với updateUser
            };
            console.log("Payload gửi đến updateUser:", JSON.stringify(payload, null, 2));

            // Gọi API để cập nhật thông tin bằng updateUser
            const updatedUser = await updateUser(userInfo.id, payload, token);
            console.log("Backend update response:", JSON.stringify(updatedUser, null, 2));
            setUserInfo(updatedUser);
            message.success("Cập nhật thông tin thành công!");
            setFile(null);
            setPreviewUrl(null); // Reset preview URL
            setIsEditing(false); // Đóng form
            form.setFieldsValue({
                ...updatedUser,
                dateOfBirth: updatedUser.dateOfBirth ? dayjs(updatedUser.dateOfBirth) : null,
            });
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
        console.log("Hàm handleCancel được gọi");
        setIsEditing(false);
        setFile(null);
        setPreviewUrl(null); // Reset preview URL
        form.setFieldsValue({
            fullname: userInfo.fullname,
            email: userInfo.email,
            phone: userInfo.phone,
            address: userInfo.address,
            citizenId: userInfo.citizenId,
            dateOfBirth: userInfo.dateOfBirth ? dayjs(userInfo.dateOfBirth) : null,
        });
    };

    return (
        <div className="user-profile">
            {loading ? (
                <Spin tip="Đang tải..." />
            ) : (
                <div className="user-profile-content">
                    {isEditing ? (
                        // Chế độ chỉnh sửa
                        <div>
                            <div className="profile-header">
                                <div className="avatar-section">
                                    <img
                                        src={previewUrl || userInfo.avatar || "https://example.com/default-avatar.png"}
                                        alt="Avatar"
                                        className="avatar"
                                    />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="avatar-upload"
                                    />
                                </div>
                            </div>

                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={onFinish}
                                onFinishFailed={(errorInfo) => {
                                    console.log("Form validation failed:", errorInfo);
                                }}
                                className="profile-form"
                            >
                                <Form.Item
                                    name="fullname"
                                    label="Họ và tên"
                                    rules={[{ required: false, message: "Vui lòng nhập họ và tên" }]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    name="email"
                                    label="Email"
                                    rules={[{ required: false, message: "Vui lòng nhập email" }, { type: "email", message: "Email không hợp lệ" }]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    name="phone"
                                    label="Số điện thoại"
                                    rules={[{ required: false, message: "Vui lòng nhập số điện thoại" }]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    name="address"
                                    label="Địa chỉ"
                                    rules={[{ required: false, message: "Vui lòng nhập địa chỉ" }]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    name="citizenId"
                                    label="Căn cước công dân"
                                    rules={[{ required: false, message: "Vui lòng nhập căn cước công dân" }]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    name="dateOfBirth"
                                    label="Ngày sinh"
                                    rules={[{ required: false, message: "Vui lòng chọn ngày sinh" }]}
                                >
                                    <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
                                </Form.Item>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit" loading={loading} style={{ marginRight: 8 }}>
                                        Lưu thay đổi
                                    </Button>
                                    <Button onClick={handleCancel}>Hủy</Button>
                                </Form.Item>
                            </Form>
                        </div>
                    ) : (
                        // Chế độ xem
                        <div>
                            <div className="profile-header">
                                <img
                                    src={userInfo.avatar || "https://example.com/default-avatar.png"}
                                    alt="Avatar"
                                    className="avatar"
                                />
                                <div className="profile-info">
                                    <h2>Họ và tên: {userInfo.fullname || "Chưa cập nhật"}</h2>
                                    <p>Email: {userInfo.email || "Chưa cập nhật"}</p>
                                    <p>Số điện thoại: {userInfo.phone || "Chưa cập nhật"}</p>
                                    <p>Địa chỉ: {userInfo.address || "Chưa cập nhật"}</p>
                                    <p>Ngày sinh: {userInfo.dateOfBirth || "Chưa cập nhật"}</p>
                                    <p>Căn cước công dân: {userInfo.citizenId || "Chưa cập nhật"}</p>
                                </div>
                            </div>

                            <div className="profile-actions">
                                <Button
                                    type="link"
                                    onClick={() => {
                                        console.log("Nhấn nút Chỉnh sửa hồ sơ");
                                        setIsEditing(true);
                                    }}
                                    className="linkto"
                                >
                                    Chỉnh sửa hồ sơ
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default memo(UserProfile);