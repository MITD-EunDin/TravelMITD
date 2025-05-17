import axios from 'axios';
import { getTokenFromStorage } from '../utils/auth';

const BASE_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/tours`;

const getAuthHeaders = () => {
  const token = getTokenFromStorage();
  console.log('Token:', token);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getAllTours = async () => {
  try {
    const response = await axios.get(BASE_URL);
    return response.data.result;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách tour:', error);
    throw error;
  }
};

export const addTour = async (tourData) => {
  const response = await axios.post(BASE_URL, tourData, { headers: getAuthHeaders() });
  return response.data.result;
};

export const updateTour = async (id, tourData) => {
  const response = await axios.put(`${BASE_URL}/${id}`, tourData, { headers: getAuthHeaders() });
  return response.data.result;
};

export const deleteTour = async (id) => {
  const response = await axios.delete(`${BASE_URL}/${id}`, { headers: getAuthHeaders() });
  return response.data.message;
};

export const addSchedule = async (tourId, scheduleData) => {
  try {
    const response = await axios.post(`${BASE_URL}/${tourId}/schedule`, scheduleData, {
      headers: getAuthHeaders(),
    });
    return response.data.result;
  } catch (error) {
    console.error('Lỗi khi thêm lịch khởi hành:', error);
    throw error;
  }
};

export const filterTours = async (filterParams) => {
  try {
    const response = await axios.get(`${BASE_URL}/filter`, {
      params: filterParams,
    });
    return response.data.result;
  } catch (error) {
    console.error('Lỗi khi lọc tour:', error);
    throw error;
  }
};