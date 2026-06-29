import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const API_URL_KEY = 'api_url';
const DEFAULT_API_URL = 'https://beliefsystemsapp.onrender.com/api'; // Cloud backend (Render)

export const storage = {
  getToken: async () => {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (e) {
      console.error('Error getting token', e);
      return null;
    }
  },
  setToken: async (token) => {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
      console.error('Error setting token', e);
    }
  },
  removeToken: async () => {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      console.error('Error removing token', e);
    }
  },

  getUser: async () => {
    try {
      const user = await AsyncStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch (e) {
      console.error('Error getting user', e);
      return null;
    }
  },
  setUser: async (user) => {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Error setting user', e);
    }
  },
  removeUser: async () => {
    try {
      await AsyncStorage.removeItem(USER_KEY);
    } catch (e) {
      console.error('Error removing user', e);
    }
  },

  getApiUrl: async () => {
    try {
      const url = await AsyncStorage.getItem(API_URL_KEY);
      return url || DEFAULT_API_URL;
    } catch (e) {
      console.error('Error getting API URL', e);
      return DEFAULT_API_URL;
    }
  },
  setApiUrl: async (url) => {
    try {
      await AsyncStorage.setItem(API_URL_KEY, url);
    } catch (e) {
      console.error('Error setting API URL', e);
    }
  },

  clearAll: async () => {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
    } catch (e) {
      console.error('Error clearing session', e);
    }
  }
};
