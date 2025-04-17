import axios from 'axios';

// Define the API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

// Create axios instance for public API
export const publicApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create axios instance for admin API with authentication
export const adminApi = axios.create({
  baseURL: `${API_URL}/admin`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token in admin API requests
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle authentication errors
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle different authentication error scenarios
    if (error.response) {
      // Unauthorized - token invalid or missing
      if (error.response.status === 401) {
        console.error('Authentication error: Unauthorized access');
        localStorage.removeItem('token');
        localStorage.removeItem('admin');
        window.location.href = '/admin/login?error=session_expired';
      }
      
      // Forbidden - insufficient permissions
      if (error.response.status === 403) {
        console.error('Authorization error: Insufficient permissions');
        // We don't log out here, just notify the user they don't have permission
      }
    }
    return Promise.reject(error);
  }
);

// Public API endpoints
export const surveyApi = {
  submitSurvey: (data: any) => publicApi.post('/surveys', { survey: data }),
  getAnalytics: () => publicApi.get('/surveys/analytics'),
};

// Admin authentication endpoints
export const authApi = {
  login: (credentials: { email: string; password: string }) => 
    adminApi.post('/login', { admin: credentials }),
  logout: () => adminApi.delete('/logout'),
  getProfile: () => adminApi.get('/profile'),
  updateProfile: (data: any) => adminApi.patch('/update_profile', data),
  changePassword: (data: any) => adminApi.post('/change_password', data),
};

// Admin dashboard endpoints
export const dashboardApi = {
  getStats: () => adminApi.get('/dashboard'),
  getHipaaCompliance: () => adminApi.get('/dashboard/hipaa_compliance'),
};

// Admin patient management endpoints
export const patientApi = {
  getPatients: (params?: any) => adminApi.get('/patients', { params }),
  getPatient: (id: number) => adminApi.get(`/patients/${id}`),
  createPatient: (data: any) => adminApi.post('/patients', { patient: data }),
  updatePatient: (id: number, data: any) => adminApi.patch(`/patients/${id}`, { patient: data }),
  deletePatient: (id: number) => adminApi.delete(`/patients/${id}`),
  getPatientSurveys: (id: number) => adminApi.get(`/patients/${id}/surveys`),
};

// Admin survey management endpoints
export const surveyResponseApi = {
  getSurveys: (params?: any) => adminApi.get('/survey_responses', { params }),
  getSurvey: (id: number) => adminApi.get(`/survey_responses/${id}`),
  deleteSurvey: (id: number) => adminApi.delete(`/survey_responses/${id}`),
  flagSurvey: (id: number, reason: string) => adminApi.post(`/survey_responses/${id}/flag`, { reason }),
  unflagSurvey: (id: number) => adminApi.post(`/survey_responses/${id}/unflag`),
  addNote: (id: number, content: string) => adminApi.post(`/survey_responses/${id}/add_note`, { content }),
  exportSurveys: () => adminApi.get('/survey_responses/export'),
};

// Admin analytics endpoints
export const analyticsApi = {
  getAnalytics: () => adminApi.get('/analytics'),
  getSurveysByWorkflow: () => adminApi.get('/analytics/surveys_by_workflow'),
  getResponseTrends: () => adminApi.get('/analytics/response_trends'),
  getDemographicBreakdown: () => adminApi.get('/analytics/demographic_breakdown'),
  getPatientDemographics: () => adminApi.get('/analytics/patient_demographics'),
  getQuestionInsights: (id: number) => adminApi.get(`/analytics/${id}/question_insights`),
  exportData: () => adminApi.get('/analytics/export_data'),
};

// Admin audit log endpoints
export const auditLogApi = {
  getAuditLogs: (params?: any) => adminApi.get('/audit_logs', { params }),
  exportAuditLogs: () => adminApi.get('/audit_logs/export'),
};

// Admin survey workflow endpoints
export const workflowApi = {
  getWorkflows: () => adminApi.get('/survey_workflows'),
  getWorkflow: (id: number) => adminApi.get(`/survey_workflows/${id}`),
  createWorkflow: (data: any) => adminApi.post('/survey_workflows', { survey_workflow: data }),
  updateWorkflow: (id: number, data: any) => adminApi.patch(`/survey_workflows/${id}`, { survey_workflow: data }),
  deleteWorkflow: (id: number) => adminApi.delete(`/survey_workflows/${id}`),
  addQuestion: (id: number, questionId: number, position?: number) => 
    adminApi.post(`/survey_workflows/${id}/add_question`, { question_id: questionId, position }),
  removeQuestion: (id: number, questionId: number) => 
    adminApi.delete(`/survey_workflows/${id}/remove_question`, { data: { question_id: questionId } }),
  reorderQuestions: (id: number, questionOrder: any[]) => 
    adminApi.patch(`/survey_workflows/${id}/reorder_questions`, { question_order: questionOrder }),
};

// Admin question endpoints
export const questionApi = {
  getQuestions: (params = {}) => adminApi.get('/questions', { params }),
  getQuestion: (id: number) => adminApi.get(`/questions/${id}`),
  createQuestion: (data: any) => adminApi.post('/questions', { question: data }),
  updateQuestion: (id: number, data: any) => adminApi.patch(`/questions/${id}`, { question: data }),
  deleteQuestion: (id: number) => adminApi.delete(`/questions/${id}`),
};

// Admin question template endpoints
export const questionTemplateApi = {
  getTemplates: (params = {}) => adminApi.get('/question_templates', { params }),
  getTemplate: (id: number) => adminApi.get(`/question_templates/${id}`),
  createTemplate: (data: any) => adminApi.post('/question_templates', { question_template: data }),
  updateTemplate: (id: number, data: any) => adminApi.patch(`/question_templates/${id}`, { question_template: data }),
  deleteTemplate: (id: number) => adminApi.delete(`/question_templates/${id}`),
  getCategories: () => adminApi.get('/question_templates/categories'),
  createQuestion: (id: number) => adminApi.post(`/question_templates/${id}/create_question`),
};

// Admin user management endpoints
export const adminUserApi = {
  getAdmins: () => adminApi.get('/admins'),
  getAdmin: (id: number) => adminApi.get(`/admins/${id}`),
  createAdmin: (data: any) => adminApi.post('/admins', { admin: data }),
  updateAdmin: (id: number, data: any) => adminApi.patch(`/admins/${id}`, { admin: data }),
  deleteAdmin: (id: number) => adminApi.delete(`/admins/${id}`),
  resetPassword: (id: number) => adminApi.post(`/admins/${id}/reset_password`),
};
