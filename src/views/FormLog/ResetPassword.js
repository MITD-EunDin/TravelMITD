import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";
import { toast } from "react-toastify";
import { updatePasswordApi } from "../../api/Api";

const FloatingInput = ({ type = "text", label, value, onChange, required = false, ...props }) => {
    const id = label.toLowerCase().replace(/\s+/g, "-");
    const hasValue = !!value;

    return (
        <div className="relative w-full mt-4">
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                required={required}
                placeholder=" "
                className={`peer w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-transparent ${hasValue ? "has-value" : ""}`}
                {...props}
            />
            <label
                htmlFor={id}
                className={`absolute left-4 bg-white px-1 transition-all duration-200 pointer-events-none
          ${value ? "-top-2 text-md text-black" : "top-4 text-md text-gray-400"}
          peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-400
          peer-focus:-top-2 peer-focus:text-md peer-focus:text-black`}
            >
                {label}
            </label>
        </div>
    );
};

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState(""); // Lưu email từ verifyPasswordResetCode
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const oobCode = urlParams.get("oobCode");

        if (!oobCode) {
            setError("Liên kết không hợp lệ. Vui lòng thử lại.");
            return;
        }

        const auth = getAuth();
        verifyPasswordResetCode(auth, oobCode)
            .then((userEmail) => {
                setEmail(userEmail); // Lưu email để đồng bộ mật khẩu
            })
            .catch((error) => {
                if (error.code === "auth/invalid-action-code") {
                    setError("Liên kết đã hết hạn hoặc đã được sử dụng. Vui lòng yêu cầu đặt lại mật khẩu lần nữa.");
                } else {
                    setError("Lỗi xác minh liên kết: " + error.message);
                }
            });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        const urlParams = new URLSearchParams(window.location.search);
        const oobCode = urlParams.get("oobCode");

        try {
            const auth = getAuth();
            await confirmPasswordReset(auth, oobCode, newPassword);

            if (!email) {
                throw new Error("Không tìm thấy email để đồng bộ mật khẩu.");
            }

            // Đồng bộ mật khẩu với backend ngay lập tức
            await updatePasswordApi(email, newPassword);
            console.log("Mật khẩu đã được đồng bộ với backend cho email:", email);

            setSuccess("Đặt lại mật khẩu thành công! Vui lòng đăng nhập để tiếp tục.");
            toast.success("Đặt lại mật khẩu thành công! Vui lòng đăng nhập để tiếp tục.");
            setTimeout(() => navigate("/login"), 3000);
        } catch (error) {
            console.error("Lỗi khi đổi mật khẩu:", error);
            if (error.code === "auth/invalid-action-code") {
                setError("Liên kết đã hết hạn hoặc đã được sử dụng. Vui lòng yêu cầu đặt lại mật khẩu lần nữa.");
            } else if (error.message.includes("USER_NOT_EXISTED")) {
                setError("Email không tồn tại trong hệ thống. Vui lòng kiểm tra lại.");
            } else if (error.message.includes("INVALID_EMAIL")) {
                setError("Email không hợp lệ. Vui lòng nhập đúng định dạng email.");
            } else {
                setError("Lỗi khi đổi mật khẩu: " + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-96 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Đặt lại mật khẩu</h2>
                {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}
                {success && <div className="mb-4 text-green-500 text-sm">{success}</div>}
                <form onSubmit={handleSubmit}>
                    <FloatingInput
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        label="Mật khẩu mới"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-2 rounded-lg text-white transition duration-200 ${loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"} mt-4`}
                    >
                        {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;