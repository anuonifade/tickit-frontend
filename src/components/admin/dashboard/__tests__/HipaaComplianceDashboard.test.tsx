import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HipaaComplianceDashboard from '../HipaaComplianceDashboard';

describe('HipaaComplianceDashboard', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <HipaaComplianceDashboard />
      </MemoryRouter>
    );
  });
});
