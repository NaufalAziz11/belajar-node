import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

export const registerUser = async (username, email, password) => {
    return axios.post(`${API_URL}/register`, { username, email, password });
};

export const loginUser = async (email, password) => {
    return axios.post(`${API_URL}/login`, { email, password });
};
