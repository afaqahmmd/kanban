import { api } from '@/api/api';
import { LoginCredentials, SignupCredentials, AuthResponse } from '@/types/index';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials);
    // Store the token
    localStorage.setItem('token', data.token);
    return data;
  },

  signup: async (credentials: SignupCredentials): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/register', credentials);
    // Store the token
    localStorage.setItem('token', data.token);
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
  }
};
