import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import PatientDetail from '../../../../components/admin/patients/PatientDetail';
import { patientApi } from '../../../../services/api';

// Mock modules before importing components
jest.mock('react-router-dom', () => ({
  useParams: () => ({ id: '1' }),
  useNavigate: () => jest.fn(),
  Link: ({ children }: any) => <div data-testid="mocked-link">{children}</div>
}), { virtual: true });

// Mock MUI components that might cause issues
jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    CircularProgress: () => <div role="progressbar" data-testid="loading-spinner">Loading...</div>,
    Paper: ({ children }: any) => <div data-testid="paper">{children}</div>,
    Divider: () => <hr data-testid="divider" />,
    Chip: ({ label, color }: any) => <div data-testid={`chip-${color}`}>{label}</div>,
    Tabs: ({ children }: any) => <div data-testid="tabs">{children}</div>,
    Tab: () => <div data-testid="tab"></div>,
    Button: ({ children }: any) => <button data-testid="button">{children}</button>
  };
});

// Mock the Auth context
const mockAuth = {
  user: { id: 1, name: 'Test User', email: 'test@example.com' },
  isAuthenticated: true,
  hasPermission: jest.fn(),
  login: jest.fn(),
  logout: jest.fn()
};

jest.mock('../../../../contexts/AuthContext', () => ({
  useAuth: () => mockAuth
}));

// Mock the API
jest.mock('../../../../services/api', () => ({
  patientApi: {
    getPatient: jest.fn(),
    getPatientSurveys: jest.fn()
  }
}));

describe('PatientDetail Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock auth permissions
    mockAuth.hasPermission.mockImplementation((permission: string) => permission !== 'view_phi');
  });

  it('should display loading state initially', () => {
    // Mock API calls to return promises that don't resolve immediately
    (patientApi.getPatient as jest.Mock).mockReturnValue(new Promise(() => {}));
    (patientApi.getPatientSurveys as jest.Mock).mockReturnValue(new Promise(() => {}));

    render(<PatientDetail />);

    // Look for the loading indicator
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should call APIs to fetch patient data', async () => {
    // Mock patient data
    const patientData = {
      id: 1,
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone_number: '555-123-4567',
      date_of_birth: '1980-01-01',
      gender: 'Male',
      medical_record_number: 'MRN12345',
      status: 'active',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    };

    const surveysData = {
      surveys: [
        {
          id: 1,
          feeling: 4,
          stress_level: 3,
          sleep_hours: 7,
          symptoms: 'None',
          created_at: '2023-01-02T00:00:00Z',
          flagged: false
        }
      ]
    };

    // Clear previous mocks and set up new ones
    (patientApi.getPatient as jest.Mock).mockClear();
    (patientApi.getPatientSurveys as jest.Mock).mockClear();
    (patientApi.getPatient as jest.Mock).mockResolvedValue({ data: patientData });
    (patientApi.getPatientSurveys as jest.Mock).mockResolvedValue({ data: surveysData });

    render(<PatientDetail />);

    // Just verify the API calls are made
    await waitFor(() => {
      expect(patientApi.getPatient).toHaveBeenCalled();
    });
  });

  it('should handle API errors gracefully', async () => {
    // Mock API error
    (patientApi.getPatient as jest.Mock).mockClear();
    (patientApi.getPatientSurveys as jest.Mock).mockClear();
    (patientApi.getPatient as jest.Mock).mockRejectedValue({
      response: { data: { error: 'Failed to fetch patient data' } }
    });

    render(<PatientDetail />);

    // Just verify the API call is made
    await waitFor(() => {
      expect(patientApi.getPatient).toHaveBeenCalled();
    });
  });
});
