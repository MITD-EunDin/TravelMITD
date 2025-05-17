import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { updatePasswordApi, getMyInfo } from "../../api/Api";
import { getAuth, verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";
import { getTokenFromStorage } from "../../utils/auth";

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

        const urlParams = new URLSearchParams(window.location.search);
        const oobCode = urlParams.get("oobCode");

        try {
            const auth = getAuth();
            await confirmPasswordReset(auth, oobCode, newPassword);

            // Đồng bộ mật khẩu với backend nếu có token
            const token = getTokenFromStorage();
            if (token) {
                const userInfo = await getMyInfo(token);
                if (userInfo && userInfo.id) {
                    await updatePasswordApi(userInfo.id, newPassword);
                    console.log("Mật khẩu đã được đồng bộ với backend cho người dùng:", userInfo.id);
                }
            } else {
                console.warn("Không có token. Mật khẩu đã được đổi trong Firebase, nhưng chưa đồng bộ với backend. Vui lòng đăng nhập lại.");
            }

            setSuccess("Đổi mật khẩu thành công! Vui lòng đăng nhập lại để đồng bộ mật khẩu với hệ thống.");
            setTimeout(() => navigate("/login"), 3000);
        } catch (error) {
            console.error("Lỗi khi đổi mật khẩu:", error);
            if (error.code === "auth/invalid-action-code") {
                setError("Liên kết đã hết hạn hoặc đã được sử dụng. Vui lòng yêu cầu đặt lại mật khẩu lần nữa.");
            } else {
                setError("Lỗi khi đổi mật khẩu: " + error.message);
            }
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
                        className="w-full py-2 rounded-lg text-white bg-blue-500 hover:bg-blue-600 transition duration-200 mt-4"
                    >
                        Đổi mật khẩu
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;