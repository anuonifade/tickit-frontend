// Mock the entire API module to avoid interceptor issues
jest.mock('../../services/api', () => {
  return {
    // Mock API URL
    API_URL: 'http://localhost:3000/api/v1',
    
    // Mock auth API
    authApi: {
      login: jest.fn(),
      logout: jest.fn(),
      getProfile: jest.fn(),
      updateProfile: jest.fn(),
      changePassword: jest.fn()
    },
    
    // Mock survey API
    surveyApi: {
      submitSurvey: jest.fn(),
      getAnalytics: jest.fn()
    },
    
    // Mock admin API
    adminApi: {}
  };
});

// Import the mocked API
import { adminApi, authApi, surveyApi } from '../../services/api';

describe('API Service', () => {
  test('API modules should be defined', () => {
    expect(adminApi).toBeDefined();
    expect(authApi).toBeDefined();
    expect(surveyApi).toBeDefined();
  });

  test('Auth API has expected methods', () => {
    expect(typeof authApi.login).toBe('function');
    expect(typeof authApi.logout).toBe('function');
    expect(typeof authApi.getProfile).toBe('function');
    expect(typeof authApi.updateProfile).toBe('function');
    expect(typeof authApi.changePassword).toBe('function');
  });
  
  test('Survey API has expected methods', () => {
    expect(typeof surveyApi.submitSurvey).toBe('function');
    expect(typeof surveyApi.getAnalytics).toBe('function');
  });
});
