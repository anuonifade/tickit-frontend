import axios from 'axios';
import { adminApi } from '../../services/api';

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn()
  })),
  defaults: { headers: { common: {} } }
}));

describe('API Service', () => {
  let requestInterceptor: any;
  let responseInterceptor: any;
  let mockAxiosInstance: any;
  
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Create a new axios instance for testing
    mockAxiosInstance = axios.create();
    
    // Capture the interceptors
    requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
    responseInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0];
  });
  
  describe('Request Interceptor', () => {
    it('should add Authorization header when token exists', () => {
      // Set up localStorage with token
      localStorage.setItem('token', 'test-token');
      
      const config = { headers: {} };
      const result = requestInterceptor(config);
      
      expect(result.headers.Authorization).toBe('Bearer test-token');
    });
    
    it('should not add Authorization header when token does not exist', () => {
      const config = { headers: {} };
      const result = requestInterceptor(config);
      
      expect(result.headers.Authorization).toBeUndefined();
    });
  });
  
  describe('Response Interceptor', () => {
    it('should pass through successful responses', () => {
      const successHandler = responseInterceptor[0];
      const response = { data: { success: true } };
      
      expect(successHandler(response)).toBe(response);
    });
    
    it('should handle 401 unauthorized errors', () => {
      // Mock window.location.href
      const originalLocation = window.location;
      delete window.location;
      window.location = { ...originalLocation, href: '' };
      
      // Set up localStorage with token and admin
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('admin', JSON.stringify({ email: 'test@example.com' }));
      
      const errorHandler = responseInterceptor[1];
      const error = {
        response: {
          status: 401,
          data: { error: 'Unauthorized' }
        }
      };
      
      // Call the error handler
      expect(() => errorHandler(error)).toThrow();
      
      // Check that localStorage was cleared
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('admin')).toBeNull();
      
      // Check that redirect happened
      expect(window.location.href).toBe('/admin/login?error=session_expired');
      
      // Restore window.location
      window.location = originalLocation;
    });
    
    it('should handle 403 forbidden errors', () => {
      // Mock console.error
      const originalConsoleError = console.error;
      console.error = jest.fn();
      
      const errorHandler = responseInterceptor[1];
      const error = {
        response: {
          status: 403,
          data: { error: 'Forbidden' }
        }
      };
      
      // Call the error handler
      expect(() => errorHandler(error)).toThrow();
      
      // Check that console.error was called
      expect(console.error).toHaveBeenCalledWith('Authorization error: Insufficient permissions');
      
      // Restore console.error
      console.error = originalConsoleError;
    });
    
    it('should pass through other errors', () => {
      const errorHandler = responseInterceptor[1];
      const error = {
        response: {
          status: 500,
          data: { error: 'Server error' }
        }
      };
      
      // Call the error handler
      expect(() => errorHandler(error)).toThrow();
    });
  });
});
