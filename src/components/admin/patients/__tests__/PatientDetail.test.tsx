import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PatientDetail from '../PatientDetail';

describe('PatientDetail', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <PatientDetail />
      </MemoryRouter>
    );
  });
});
