import { createContext, useState, useContext, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { login, introspectToken, getMyInfo, loginWithGoogleApi, updatePasswordApi } from "../api/Api";
import { saveTokenToStorage, getTokenFromStorage, removeTokenFromStorage } from "../utils/auth";
import { signInWithGoogle, sendPasswordReset } from "../firebase/firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(getTokenFromStorage() || null);

    const loginUser = async (username, password) => {
        try {
            // Kiểm tra token hiện tại và đồng bộ mật khẩu trước
            const storedToken = getTokenFromStorage();
            if (storedToken) {
                const decoded = jwtDecode(storedToken);
                const userInfo = await getMyInfo(storedToken);
                if (userInfo && userInfo.id) {
                    const pendingPassword = localStorage.getItem("pendingPasswordSync") || password;
                    await updatePasswordApi(userInfo.id, pendingPassword);
                    console.log("Mật khẩu đã được đồng bộ với backend cho người dùng:", userInfo.id);
                    localStorage.removeItem("pendingPasswordSync"); // Xóa sau khi đồng bộ
                }
            }

            // Đăng nhập với mật khẩu đã đồng bộ
            const authResponse = await login(username, password);
            if (authResponse.token) {
                saveTokenToStorage(authResponse.token);
                setToken(authResponse.token);
                const decoded = jwtDecode(authResponse.token);
                console.log("Token giải mã từ đăng nhập:", decoded);
                const userInfo = await getMyInfo(authResponse.token);
                console.log("Thông tin người dùng từ đăng nhập:", userInfo);
                const userData = { ...userInfo, scope: decoded.scope || userInfo.scope || "USER" };
                console.log("Dữ liệu người dùng từ đăng nhập:", userData);
                setUser(userData);
                return userData.scope;
            }
            return null;
        } catch (error) {
            console.error("Lỗi đăng nhập:", error);
            throw new Error("Đăng nhập thất bại: " + (error.message || "Thông tin đăng nhập không hợp lệ."));
        }
    };

    const loginWithGoogle = async () => {
        try {
            const { user, idToken } = await signInWithGoogle();
            // Gọi API backend để xác thực idToken và nhận JWT
            const authResponse = await loginWithGoogleApi(idToken);
            if (authResponse.token) {
                saveTokenToStorage(authResponse.token);
                setToken(authResponse.token);
                const decoded = jwtDecode(authResponse.token);
                console.log("Google login decoded token:", decoded);
                const userInfo = await getMyInfo(authResponse.token);
                console.log("Google login userInfo:", userInfo);
                const userData = { ...userInfo, scope: decoded.scope || userInfo.scope || "USER" };
                console.log("Google login userData:", userData);
                setUser(userData);
                return userData.scope;
            }
            return null;
        } catch (error) {
            console.error("Google login error:", error);
            return null;
        }
    };

    const resetPassword = async (email) => {
        try {
            await sendPasswordReset(email);
            return true;
        } catch (error) {
            if (error.code === "auth/user-not-found") {
                throw new Error("Email không tồn tại. Vui lòng kiểm tra lại.");
            } else if (error.code === "auth/invalid-email") {
                throw new Error("Email không hợp lệ. Vui lòng nhập đúng định dạng email.");
            }
            throw new Error("Lỗi khi gửi email đặt lại mật khẩu: " + error.message);
        }
    };

    const logout = () => {
        removeTokenFromStorage();
        setToken(null);
        setUser(null);
    };

    useEffect(() => {
        const storedToken = getTokenFromStorage();
        if (storedToken) {
            const checkToken = async () => {
                try {
                    const decoded = jwtDecode(storedToken);
                    console.log("Check token decoded:", decoded);
                    const introspectResponse = await introspectToken(storedToken);
                    if (introspectResponse.valid && decoded.exp * 1000 > Date.now()) {
                        const userInfo = await getMyInfo(storedToken);
                        console.log("Check token userInfo:", userInfo);
                        const userData = { ...userInfo, scope: decoded.scope || userInfo.scope || "USER" };
                        console.log("Check token userData:", userData);
                        setUser(userData);
                        setToken(storedToken);
                    } else {
                        logout();
                    }
                } catch (error) {
                    console.error("Token validation error:", error);
                    logout();
                }
            };
            checkToken();
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, login: loginUser, loginWithGoogle, resetPassword, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);