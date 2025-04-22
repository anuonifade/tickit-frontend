import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AnalyticsDashboard from '../AnalyticsDashboard';

describe('AnalyticsDashboard', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <AnalyticsDashboard />
      </MemoryRouter>
    );
  });
});
