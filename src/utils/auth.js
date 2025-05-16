// Lưu token vào localStorage
export const saveTokenToStorage = (token) => {
    localStorage.setItem("token", token);
};

// Lấy token từ localStorage
export const getTokenFromStorage = () => {
    return localStorage.getItem("token");
};

// Xoá token khỏi localStorage
export const removeTokenFromStorage = () => {
    localStorage.removeItem("token");
};