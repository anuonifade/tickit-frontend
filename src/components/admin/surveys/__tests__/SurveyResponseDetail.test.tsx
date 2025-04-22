import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../../../contexts/AuthContext';
import SurveyResponseDetail from '../SurveyResponseDetail';

describe('SurveyResponseDetail', () => {
  it('renders without crashing', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <SurveyResponseDetail />
        </MemoryRouter>
      </AuthProvider>
    );
  });
});
