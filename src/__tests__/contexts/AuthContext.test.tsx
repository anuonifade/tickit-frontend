import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../services/api';

// Mock the API
jest.mock('../../services/api', () => ({
  authApi: {
    login: jest.fn(),
    logout: jest.fn(),
    getProfile: jest.fn(),
  },
}));

// Test component that uses the auth context
const TestComponent = () => {
  const { isAuthenticated, admin, login, logout } = useAuth();
  
  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'Authenticated' : 'Not authenticated'}</div>
      {admin && <div data-testid="admin-email">{admin.email}</div>}
      <button data-testid="login-button" onClick={() => login('test@example.com', 'password')}>Login</button>
      <button data-testid="logout-button" onClick={() => logout()}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    
    // Reset mocks
    jest.clearAllMocks();
  });
  
  it('should initialize as not authenticated when no token exists', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');
    expect(screen.queryByTestId('admin-email')).not.toBeInTheDocument();
  });
  
  it('should initialize as authenticated when token exists in localStorage', async () => {
    // Set up localStorage with token and admin
    const mockAdmin = { id: 1, email: 'admin@example.com', role: 'admin', first_name: 'Test', last_name: 'Admin', created_at: '', updated_at: '' };
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('admin', JSON.stringify(mockAdmin));
    
    // Mock the getProfile API call to succeed
    (authApi.getProfile as jest.Mock).mockResolvedValue({ data: mockAdmin });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for the token validation to complete
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });
    
    expect(screen.getByTestId('admin-email')).toHaveTextContent('admin@example.com');
    expect(authApi.getProfile).toHaveBeenCalled();
  });
  
  it('should clear authentication when token validation fails', async () => {
    // Set up localStorage with token and admin
    const mockAdmin = { id: 1, email: 'admin@example.com', role: 'admin', first_name: 'Test', last_name: 'Admin', created_at: '', updated_at: '' };
    localStorage.setItem('token', 'invalid-token');
    localStorage.setItem('admin', JSON.stringify(mockAdmin));
    
    // Mock the getProfile API call to fail with 401
    (authApi.getProfile as jest.Mock).mockRejectedValue({ 
      response: { status: 401, data: { error: 'Unauthorized' } } 
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for the token validation to complete
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');
    });
    
    expect(screen.queryByTestId('admin-email')).not.toBeInTheDocument();
    expect(authApi.getProfile).toHaveBeenCalled();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('admin')).toBeNull();
  });
  
  it('should authenticate user on successful login', async () => {
    const mockAdmin = { id: 1, email: 'test@example.com', role: 'admin', first_name: 'Test', last_name: 'User', created_at: '', updated_at: '' };
    const mockToken = 'mock-token';
    
    // Mock the login API call
    (authApi.login as jest.Mock).mockResolvedValue({ 
      data: { admin: mockAdmin, token: mockToken } 
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Click the login button
    await act(async () => {
      userEvent.click(screen.getByTestId('login-button'));
    });
    
    // Wait for authentication to complete
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });
    
    expect(screen.getByTestId('admin-email')).toHaveTextContent('test@example.com');
    expect(authApi.login).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password' });
    expect(localStorage.getItem('token')).toBe(mockToken);
    expect(localStorage.getItem('admin')).toBe(JSON.stringify(mockAdmin));
  });
  
  it('should handle login failure', async () => {
    // Mock the login API call to fail
    (authApi.login as jest.Mock).mockRejectedValue({ 
      response: { status: 401, data: { error: 'Invalid credentials' } } 
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Spy on console.error
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Click the login button
    await act(async () => {
      userEvent.click(screen.getByTestId('login-button'));
    });
    
    // Wait for authentication to fail
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');
    });
    
    expect(screen.queryByTestId('admin-email')).not.toBeInTheDocument();
    expect(authApi.login).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password' });
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('admin')).toBeNull();
  });
  
  it('should log out the user', async () => {
    // Set up authenticated state
    const mockAdmin = { id: 1, email: 'admin@example.com', role: 'admin', first_name: 'Test', last_name: 'Admin', created_at: '', updated_at: '' };
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('admin', JSON.stringify(mockAdmin));
    
    // Mock the getProfile and logout API calls
    (authApi.getProfile as jest.Mock).mockResolvedValue({ data: mockAdmin });
    (authApi.logout as jest.Mock).mockResolvedValue({ data: { message: 'Logged out successfully' } });
    
    // Mock window.location.href
    const originalLocation = window.location;
    delete window.location;
    window.location = { ...originalLocation, href: '' };
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for initial authentication
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });
    
    // Click the logout button
    await act(async () => {
      userEvent.click(screen.getByTestId('logout-button'));
    });
    
    // Check that logout was called
    expect(authApi.logout).toHaveBeenCalled();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('admin')).toBeNull();
    
    // Restore window.location
    window.location = originalLocation;
  });
});
