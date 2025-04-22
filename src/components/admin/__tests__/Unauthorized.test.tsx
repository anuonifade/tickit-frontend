import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../../contexts/AuthContext';
import Unauthorized from '../Unauthorized';

describe('Unauthorized', () => {
  it('renders without crashing', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <Unauthorized />
        </MemoryRouter>
      </AuthProvider>
    );
  });
});
