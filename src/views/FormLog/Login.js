import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaUserCircle } from "react-icons/fa";
import { useAuth } from "../../Contexts/AuthContext";
import logodtc from '../../assets/logoDTC.png'

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
    const { login, user } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const scope = await login(username, password);
            console.log("LoginForm - Scope returned from login:", scope); // Debug: Kiểm tra scope
            if (scope) {
                console.log("LoginForm - Login successful, redirecting with scope:", scope);
                if (scope === "STAFF") {
                    navigate("/employee/dashboard");
                } else if (scope === "ADMIN") {
                    navigate("/admin/dashboard");
                } else {
                    navigate("/");
                }
            } else {
                setError("Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản và mật khẩu.");
            }
        } catch (err) {
            console.error("LoginForm - Login error:", err);
            setError("Có lỗi xảy ra. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    // Theo dõi user để debug, nhưng không cần điều hướng ở đây
    useEffect(() => {
        if (user) {
            console.log("LoginForm - User object:", user);
            console.log("LoginForm - User scope:", user.scope);
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
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Đăng nhập</h2>

                {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}

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
                        <a href="#" className="text-blue-500 hover:underline">
                            Quên mật khẩu?
                        </a>
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
                    <p>Hoặc đăng nhập với</p>
                    <div className="flex flex-row gap-5 justify-center">
                        <button className="flex items-center justify-center w-12 h-12 border rounded-full hover:bg-gray-100 transition">
                            <FcGoogle className="w-6 h-6" />
                        </button>
                        <button className="flex items-center justify-center w-12 h-12 border rounded-full text-blue-600 hover:bg-gray-100 transition">
                            <FaFacebook className="w-6 h-6" />
                        </button>
                    </div>
                </div>
                <p className="text-gray-600 mt-4">
                    Chưa có tài khoản?{" "}
                    <Link to="/signup" className="text-blue-500 hover:underline">
                        Đăng ký
                    </Link>
                </p>
            </div>
        </div>
    );
}