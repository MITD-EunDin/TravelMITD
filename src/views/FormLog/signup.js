import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { Link } from "react-router-dom";
import { registerCustomer } from "../../api/Api";
import { useNavigate } from "react-router-dom";
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

    return (
        <div className="relative w-full mt-4">
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                required={required}
                placeholder=" "
                className={`peer w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-transparent`}
                {...props}
            />
            <label
                htmlFor={id}
                className={`absolute left-4 bg-white px-1 transition-all duration-200 pointer-events-none
                    ${value ? "-top-2 text-md text-black" : "top-4 text-md text-gray-400"}
                    peer-placeholder-shown:top-4  peer-placeholder-shown:text-gray-400
                    peer-focus:-top-2 peer-focus:text-md peer-focus:text-black`}
            >
                {label}
            </label>
        </div>
    );
}

export default function SignupForm() {

    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Mật khẩu xác nhận không khớp!");
            return;
        }
        setLoading(true);

        // Kiểm tra định dạng email
        if (!email.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)) {
            alert("Định dạng email không hợp lệ!");
            setLoading(false);
            return;
        }

        try {
            // Gọi API đăng ký người dùng
            const userData = { username, email, password };
            const result = await registerCustomer(userData);
            console.log("Kết quả từ API:", result);
            // Kiểm tra kết quả trả về
            if (result && result.id) {
                alert("Đăng ký thành công!");
                navigate("/login");
            } else {
                setError(result.message || "Đăng ký thất bại, vui lòng thử lại!");
            }
        } catch (error) {
            console.error("Lỗi đăng ký:", error);
            setError("Đã xảy ra lỗi, vui lòng thử lại sau.");
        }

        setLoading(false);
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-96 text-center">
                 <img
                    src={logodtc}
                    alt="Logo"
                    className="mx-auto mb-2 w-20 h-20"
                />
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Đăng ký</h2>
                <form onSubmit={handleSubmit}>
                    <FloatingInput
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        label="Tên tài khoản"
                        required
                    />
                    <FloatingInput
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        label="Email"
                        required
                    />
                    <FloatingInput
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        label="Mật khẩu"
                        required
                    />
                    <FloatingInput
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        label="Xác nhận mật khẩu"
                        required
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-500 mt-6 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
                    >
                        Đăng ký
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
                    Đã có tài khoản? {" "}
                    <Link to="/login" className="text-blue-500 hover:underline">Đăng nhập</Link>
                </p>
            </div>
        </div>
    );
}
