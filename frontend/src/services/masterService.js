import api from './api';

// Roles
export const getRoles = () => api.get('/master/roles');

// UoMs
export const getUoms = () => api.get('/master/uoms');
export const getUom = (id) => api.get(`/master/uoms/${id}`);
export const createUom = (data) => api.post('/master/uoms', data);
export const updateUom = (id, data) => api.put(`/master/uoms/${id}`, data);
export const deleteUom = (id) => api.delete(`/master/uoms/${id}`);

// Suppliers
export const getSuppliers = () => api.get('/master/suppliers');
export const getSupplier = (id) => api.get(`/master/suppliers/${id}`);
export const createSupplier = (data) => api.post('/master/suppliers', data);
export const updateSupplier = (id, data) => api.put(`/master/suppliers/${id}`, data);
export const deleteSupplier = (id) => api.delete(`/master/suppliers/${id}`);

// Categories
export const getCategories = () => api.get('/master/categories');
export const getCategory = (id) => api.get(`/master/categories/${id}`);
export const createCategory = (data) => api.post('/master/categories', data);
export const updateCategory = (id, data) => api.put(`/master/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/master/categories/${id}`);
