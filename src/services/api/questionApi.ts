import axios from 'axios';
import { API_BASE_URL } from '../../config';

const API_URL = `${API_BASE_URL}/api/v1/admin`;

export const questionApi = {
  getQuestions: (params = {}) => {
    return axios.get(`${API_URL}/questions`, { params });
  },

  getQuestion: (id: number) => {
    return axios.get(`${API_URL}/questions/${id}`);
  },

  createQuestion: (data: any) => {
    return axios.post(`${API_URL}/questions`, { question: data });
  },

  updateQuestion: (id: number, data: any) => {
    return axios.put(`${API_URL}/questions/${id}`, { question: data });
  },

  deleteQuestion: (id: number) => {
    return axios.delete(`${API_URL}/questions/${id}`);
  }
};
