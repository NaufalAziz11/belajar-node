import api from './api';

// Raw Materials
export const getRawMaterials = () => api.get('/inventory/materials');
export const getRawMaterial = (id) => api.get(`/inventory/materials/${id}`);
export const createRawMaterial = (data) => api.post('/inventory/materials', data);
export const updateRawMaterial = (id, data) => api.put(`/inventory/materials/${id}`, data);
export const deleteRawMaterial = (id) => api.delete(`/inventory/materials/${id}`);

// Recipes (menu mapping)
export const getRecipeForMenu = (menuId) => api.get(`/inventory/recipes/${menuId}`);
export const saveRecipeForMenu = (menuId, items) => api.post(`/inventory/recipes/${menuId}`, { items });
