import axios from 'axios';

// Địa chỉ base URL của backend, bao gồm context path
const API_URL = 'http://localhost:8080';

// Tạo instance của axios với cấu hình mặc định
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Hàm đăng nhập
export const login = async (username, password) => {
    const response = await api.post('/auth/token', { username, password });
    return response.data.result; // Trả về token và authenticated
};

// Hàm kiểm tra token (introspect)
export const introspectToken = async (token) => {
    const response = await api.post('/auth/introspect', { token });
    return response.data.result; // Trả về thông tin token hợp lệ hay không
};

// Hàm đăng ký khách hàng
export const registerCustomer = async (userData) => {
    const response = await api.post('/users/customers', userData);
    return response.data.result;
};

// Tạo nhân viên (chỉ dành cho ADMIN)
export const createEmployee = async (userData, token) => {
    const response = await api.post('/users/employees', userData, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data.result;
};


// Hàm lấy danh sách người dùng (yêu cầu quyền ADMIN)
export const getAllUsers = async (token) => {
    const response = await api.get('/users', {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.result;
};

//Hàm lấy danh sách theo Role
export const getUsersByRole = async (role, token) => {
    const response = await api.get('/users', {
        params: { role },
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data.result;
};

// Hàm lấy thông tin người dùng theo ID
export const getUserById = async (id, token) => {
    const response = await api.get(`/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.result;
};

// Hàm cập nhật người dùng
export const updateUser = async (id, userData, token) => {
    const mappedData = {
        email: userData.email,
        fullname: userData.fullname,
        address: userData.address || "",
        role: [userData.role],
        phone: userData.phone,
        dateOfBirth: userData.dateOfBirth,
        citizenId: userData.citizenId,
        avatar: userData.avatar,
    };

    const response = await api.put(`/users/${id}`, mappedData, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.result;
};

// Hàm xóa người dùng
export const deleteUser = async (id, token) => {
    const response = await api.delete(`/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.result;
};

// Hàm lấy thông tin cá nhân
export const getMyInfo = async (token) => {
    const response = await api.get('/users/myInfo', {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.result;
};

export const loginWithGoogleApi = async (idToken) => {
    const response = await api.post('/auth/google', { idToken });
    return response.data; // Trả về { token, authenticated }
};

export const updatePasswordApi = async (id, newPassword) => {
    try {
        const response = await api.post('/auth/update-password', null, {
            params: { id, newPassword }
        });
        return response.data;
    } catch (error) {
        console.error("Update password API error:", error.response?.data || error.message);
        throw error;
    }
};

export default api;