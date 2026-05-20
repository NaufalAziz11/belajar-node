import api from './api';

export const createPurchase = (data) => api.post('/transactions/purchases', data);
export const createSale = (data) => api.post('/transactions/sales', data);
