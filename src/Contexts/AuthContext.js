import React, { createContext, useState, useContext, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { login, introspectToken, getMyInfo } from "../api/Api";
import { saveTokenToStorage, getTokenFromStorage, removeTokenFromStorage } from "../utils/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(getTokenFromStorage() || null);

    const loginUser = async (username, password) => {
        try {
            const authResponse = await login(username, password);
            if (authResponse.token) {
                saveTokenToStorage(authResponse.token);
                setToken(authResponse.token);
                const decoded = jwtDecode(authResponse.token);
                console.log("Login decoded token:", decoded); // Debug: Kiểm tra scope
                const userInfo = await getMyInfo(authResponse.token);
                console.log("Login userInfo:", userInfo); // Debug: Kiểm tra userInfo
                // Bảo vệ scope từ decoded, tránh bị ghi đè bởi userInfo
                const userData = { ...userInfo, scope: decoded.scope || userInfo.scope || "USER" };
                console.log("Login userData:", userData); // Debug: Kiểm tra userData
                setUser(userData);
                return userData.scope; // Trả về scope để component gọi xử lý chuyển hướng
            }
            return null;
        } catch (error) {
            console.error("Login error:", error);
            return null;
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
                    console.log("Check token decoded:", decoded); // Debug: Kiểm tra scope
                    const introspectResponse = await introspectToken(storedToken);
                    if (introspectResponse.valid && decoded.exp * 1000 > Date.now()) {
                        const userInfo = await getMyInfo(storedToken);
                        console.log("Check token userInfo:", userInfo); // Debug: Kiểm tra userInfo
                        // Bảo vệ scope từ decoded
                        const userData = { ...userInfo, scope: decoded.scope || userInfo.scope || "USER" };
                        console.log("Check token userData:", userData); // Debug: Kiểm tra userData
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
        <AuthContext.Provider value={{ user, token, login: loginUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);