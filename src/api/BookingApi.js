import axios from 'axios';

const API_URL = 'http://localhost:8080';

const API = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);



API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error('Unauthorized, redirecting to login...');
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const bookTour = async (bookingData) => {
    try {
        console.log('Booking tour:', bookingData);
        const response = await API.post('/tour_booking', bookingData);
        console.log('Book tour response:', response.data);
        return response.data.result;
    } catch (error) {
        console.error('Error booking tour:', error.response?.data || error.message);
        throw error.response?.data || error;
    }
};


export const getMyBookings = async () => {
    try {
        console.log('Fetching my bookings');
        const response = await API.get('/tour_booking/my');
        console.log('My bookings response:', response.data);
        return response.data.result;
    } catch (error) {
        console.error('Error fetching my bookings:', error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const makePayment = async (paymentData) => {
    try {
        console.log('Making payment:', paymentData);
        const response = await API.post('/payment', paymentData);
        console.log('Payment response:', response.data);
        return response.data.result;
    } catch (error) {
        console.error('Error making payment:', error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const getVnpayUrl = async (bookingId, amount) => {
    try {
        console.log('Fetching VNPAY URL for bookingId:', bookingId, 'amount:', amount);
        const response = await API.get(`/payment/vnpay-url?bookingId=${bookingId}&amount=${amount}`);
        console.log('VNPAY URL response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching VNPAY URL:', error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const getUserPayments = async () => {
    try {
        console.log('Fetching user payments');
        const response = await API.get('/payment/user');
        console.log('User payments response:', response.data);
        return response.data.result;
    } catch (error) {
        console.error('Error fetching user payments:', error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const getAllBookings = async () => {
    try {
        console.log('Fetching all bookings');
        const response = await API.get('/tour_booking/all');
        console.log('All bookings response:', response.data);
        return response.data.result;
    } catch (error) {
        console.error('Error fetching all bookings:', error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const assignEmployee = async (bookingId, data) => {
    try {
        console.log('Assigning employee to booking:', bookingId, data);
        const response = await API.patch(`/tour_booking/${bookingId}/assign`, data);
        console.log('Assign employee response:', response.data);
        return response.data.result;
    } catch (error) {
        console.error('Error assigning employee:', error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const assignEmployeeToTour = async (tourId, data) => {
    try {
        console.log('Assigning employee to tour:', tourId, data);
        const response = await API.patch(`/tour_booking/tour/${tourId}/assign`, data);
        console.log('Assign employee to tour response:', response.data);
        return response.data.result;
    } catch (error) {
        console.error('Error assigning employee to tour:', error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const getEmployees = async () => {
    try {
        console.log('Fetching employees');
        const response = await API.get('/tour_booking/employees');
        console.log('Employees response:', response.data);
        return response.data.result;
    } catch (error) {
        console.error('Error fetching employees:', error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const getEmployeeStats = async () => {
    try {
        console.log('Fetching employee stats');
        const response = await API.get('/tour_booking/employee-stats');
        console.log('Employee stats response:', response.data);
        return response.data.result;
    } catch (error) {
        console.error('Error fetching employee stats:', error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export default API;