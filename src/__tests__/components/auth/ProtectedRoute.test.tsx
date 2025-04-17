import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import { AuthProvider, useAuth } from '../../../contexts/AuthContext';

// Mock the AuthContext
jest.mock('../../../contexts/AuthContext', () => {
  const originalModule = jest.requireActual('../../../contexts/AuthContext');
  return {
    ...originalModule,
    useAuth: jest.fn(),
  };
});

describe('ProtectedRoute', () => {
  // Mock components for testing
  const TestComponent = () => <div data-testid="protected-content">Protected Content</div>;
  const mockNavigate = jest.fn();

  // Mock useNavigate
  jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
  }));

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children when user is authenticated', () => {
    // Mock authenticated state
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      admin: { role: 'admin' },
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('should redirect to login when user is not authenticated', () => {
    // Mock unauthenticated state
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      admin: null,
      isLoading: false,
    });

    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <Routes>
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute>
                <TestComponent />
              </ProtectedRoute>
            } 
          />
          <Route path="/admin/login" element={<div data-testid="login-page">Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Should redirect to login
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('should show loading state when authentication is being checked', () => {
    // Mock loading state
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      admin: null,
      isLoading: true,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Authenticating...')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('should show forbidden error when user lacks required role', () => {
    // Mock authenticated state with regular admin role
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      admin: { role: 'admin' },
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute requiredRole="super_admin">
          <TestComponent />
        </ProtectedRoute>
      </MemoryRouter>
    );

    // Should show forbidden error
    expect(screen.getByText(/This page requires super_admin privileges/i)).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('should render children when user has required role', () => {
    // Mock authenticated state with super_admin role
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      admin: { role: 'super_admin' },
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute requiredRole="super_admin">
          <TestComponent />
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });
});
