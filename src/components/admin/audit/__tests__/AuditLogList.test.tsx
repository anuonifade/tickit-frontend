import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../../../contexts/AuthContext';
import AuditLogList from '../AuditLogList';

describe('AuditLogList', () => {
  it('renders without crashing', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <AuditLogList />
        </MemoryRouter>
      </AuthProvider>
    );
  });
});
