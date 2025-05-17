import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "../../Contexts/AuthContext";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logodtc from "../../assets/logoDTC.png";

export function FloatingInput({
    type = "text",
    label,
    value,
    onChange,
    required = false,
    ...props
}) {
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
}

export default function LoginForm() {
    const { login, loginWithGoogle, resetPassword, user } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [resetMessage, setResetMessage] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const scope = await login(username, password);
            console.log("LoginForm - Phạm vi trả về từ đăng nhập:", scope);
            if (scope) {
                console.log("LoginForm - Đăng nhập thành công, đang chuyển hướng với phạm vi:", scope);
                toast.success("Đăng nhập thành công!");
                if (scope === "STAFF") {
                    navigate("/employee/dashboard");
                } else if (scope === "ADMIN") {
                    navigate("/admin/dashboard");
                } else {
                    navigate("/");
                }
            } else {
                setError("Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản và mật khẩu.");
                toast.error("Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản và mật khẩu.");
            }
        } catch (err) {
            console.error("LoginForm - Lỗi đăng nhập:", err);
            setError(err.message || "Có lỗi xảy ra. Vui lòng thử lại sau.");
            toast.error(err.message || "Có lỗi xảy ra. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError("");
        setLoading(true);
        try {
            const scope = await loginWithGoogle();
            console.log("LoginForm - Phạm vi Google:", scope);
            if (scope) {
                toast.success("Đăng nhập Google thành công!");
                if (scope === "STAFF") {
                    navigate("/employee/dashboard");
                } else if (scope === "ADMIN") {
                    navigate("/admin/dashboard");
                } else {
                    navigate("/");
                }
            } else {
                setError("Đăng nhập Google thất bại: Phản hồi không hợp lệ từ server.");
                toast.error("Đăng nhập Google thất bại: Phản hồi không hợp lệ từ server.");
            }
        } catch (error) {
            console.error("LoginForm - Lỗi đăng nhập Google:", error.response?.data || error.message);
            setError("Đăng nhập Google thất bại: " + (error.response?.data?.message || error.message));
            toast.error("Đăng nhập Google thất bại: " + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError("");
        setResetMessage("");
        setLoading(true);

        try {
            await resetPassword(resetEmail);
            setResetMessage("Email đặt lại mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư của bạn và nhấp vào liên kết trong vòng 1 giờ.");
            toast.success("Email đặt lại mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư của bạn và nhấp vào liên kết trong vòng 1 giờ.");
            setResetEmail("");
            setTimeout(() => setShowResetPassword(false), 3000);
        } catch (error) {
            console.error("LoginForm - Lỗi đặt lại mật khẩu:", error);
            setError(error.message || "Gửi email đặt lại mật khẩu thất bại. Vui lòng thử lại.");
            toast.error(error.message || "Gửi email đặt lại mật khẩu thất bại. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            console.log("LoginForm - Đối tượng người dùng:", user);
            console.log("LoginForm - Phạm vi người dùng:", user.scope);
        }
    }, [user]);

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-96 text-center">
                <div className="mx-auto mb-4 flex justify-center">
                    <img
                        src={logodtc}
                        alt="Logo"
                        className="mx-auto mb-2 w-20 h-20"
                    />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">{showResetPassword ? "Quên mật khẩu" : "Đăng nhập"}</h2>

                {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}
                {resetMessage && <div className="mb-4 text-green-500 text-sm">{resetMessage}</div>}

                {!showResetPassword ? (
                    <>
                        <form onSubmit={handleSubmit}>
                            <FloatingInput
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                label="Tên người dùng"
                                required
                            />
                            <FloatingInput
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                label="Mật khẩu"
                                required
                            />
                            <div className="my-4 flex justify-between items-center text-sm">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="mr-2"
                                    />
                                    Nhớ mật khẩu
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowResetPassword(true)}
                                    className="text-blue-500 hover:underline"
                                >
                                    Quên mật khẩu?
                                </button>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-2 rounded-lg text-white transition duration-200 ${loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
                            >
                                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                            </button>
                        </form>

                        <div className="mt-4 flex flex-col gap-2">
                            <p>Hoặc</p>
                            <div className="flex flex-row gap-5 justify-center">
                                <button
                                    onClick={handleGoogleLogin}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-4 py-2 border rounded-full hover:bg-gray-100 transition w-fit"
                                >
                                    <FcGoogle className="w-5 h-5" />
                                    <span className="text-sm font-medium text-gray-700">
                                        Đăng nhập với Google
                                    </span>
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <form onSubmit={handleResetPassword}>
                        <FloatingInput
                            type="email"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            label="Email"
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-2 rounded-lg text-white transition duration-200 ${loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"} mt-4`}
                        >
                            {loading ? "Đang gửi..." : "Gửi email đặt lại"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowResetPassword(false)}
                            className="text-blue-500 hover:underline mt-4"
                        >
                            Quay lại đăng nhập
                        </button>
                    </form>
                )}

                {!showResetPassword && (
                    <p className="text-gray-600 mt-4">
                        Chưa có tài khoản?{" "}
                        <Link to="/signup" className="text-blue-500 hover:underline">
                            Đăng ký
                        </Link>
                    </p>
                )}
            </div>
        </div>
    );
}