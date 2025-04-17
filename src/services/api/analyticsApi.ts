import axios from 'axios';
import { API_BASE_URL } from '../../config';

const API_URL = `${API_BASE_URL}/api/v1/admin`;

export const analyticsApi = {
  getAnalytics: () => {
    return axios.get(`${API_URL}/analytics`);
  },

  exportData: () => {
    return axios.get(`${API_URL}/analytics/export`, {
      responseType: 'blob'
    });
  }
};
