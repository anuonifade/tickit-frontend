import axios from 'axios';
import { API_BASE_URL } from '../../config';

const API_URL = `${API_BASE_URL}/api/v1/admin`;

export const questionTemplateApi = {
  getTemplates: (params = {}) => {
    return axios.get(`${API_URL}/question_templates`, { params });
  },

  getTemplate: (id: number) => {
    return axios.get(`${API_URL}/question_templates/${id}`);
  },

  createTemplate: (data: any) => {
    return axios.post(`${API_URL}/question_templates`, { question_template: data });
  },

  updateTemplate: (id: number, data: any) => {
    return axios.put(`${API_URL}/question_templates/${id}`, { question_template: data });
  },

  deleteTemplate: (id: number) => {
    return axios.delete(`${API_URL}/question_templates/${id}`);
  },

  getCategories: () => {
    return axios.get(`${API_URL}/question_templates/categories`);
  },

  createQuestion: (templateId: number) => {
    return axios.post(`${API_URL}/question_templates/${templateId}/create_question`);
  }
};
