import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authApi } from '../services/api';

interface Admin {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  admin: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateAdmin: (adminData: Partial<Admin>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedToken = localStorage.getItem('token');
    const storedAdmin = localStorage.getItem('admin');
    
    if (storedToken && storedAdmin) {
      setToken(storedToken);
      setAdmin(JSON.parse(storedAdmin));
      
      // Validate the token by fetching the admin profile
      authApi.getProfile()
        .then(() => {
          console.log('Token validated successfully');
        })
        .catch((error) => {
          console.error('Token validation failed:', error);
          // If token is invalid, clear the stored data
          if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            localStorage.removeItem('token');
            localStorage.removeItem('admin');
            setToken(null);
            setAdmin(null);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login({ email, password });
      const { admin, token } = response.data;
      
      if (!token) {
        throw new Error('No authentication token received');
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('admin', JSON.stringify(admin));
      
      setAdmin(admin);
      setToken(token);
    } catch (error: any) {
      console.error('Login failed:', error);
      
      // Handle specific error cases
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error('Invalid email or password');
        } else if (error.response.status === 403) {
          throw new Error('Your account does not have permission to access the admin panel');
        }
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (token) {
        await authApi.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout process even if API call fails
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      setAdmin(null);
      setToken(null);
      setIsLoading(false);
      
      // Redirect to login page after logout
      window.location.href = '/admin/login';
    }
  };

  const updateAdmin = (adminData: Partial<Admin>) => {
    if (admin) {
      const updatedAdmin = { ...admin, ...adminData };
      setAdmin(updatedAdmin);
      localStorage.setItem('admin', JSON.stringify(updatedAdmin));
    }
  };

  const value = {
    admin,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    logout,
    updateAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
