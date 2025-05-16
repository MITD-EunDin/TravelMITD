import { getUsersByRole } from '../api/userApi';

export const fetchUsers = async (token) => {
    return await getUsersByRole('USER', token);
};

export const fetchStaffs = async (token) => {
    return await getUsersByRole('STAFF', token);
};


