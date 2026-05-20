import api from './api';

export const registerUser = async (username, email, password, role_id) => {
    return api.post('/auth/register', { username, email, password, role_id });
};

export const loginUser = async (email, password) => {
    return api.post('/auth/login', { email, password });
};

export const getUsers = async () => {
    return api.get('/auth/users');
};

export const deleteUser = async (id) => {
    return api.delete(`/auth/users/${id}`);
};
