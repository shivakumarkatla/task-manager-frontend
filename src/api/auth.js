import api from './axios';

export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const forgotPassword = async (userData) => {
  const response = await api.post(
    '/auth/forgot-password',
    userData
  );

  return response.data;
};

export const resetPassword = async (token, password) => {
  const response = await api.put(
    `/auth/reset-password/${token}`,
    { password }
  );

  return response.data;
};