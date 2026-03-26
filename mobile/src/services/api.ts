import axios from "axios";
import * as SecureStore from 'expo-secure-store';

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.62:3000/api",
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('Error getting token', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);