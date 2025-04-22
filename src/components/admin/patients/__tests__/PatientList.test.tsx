import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PatientList from '../PatientList';

describe('PatientList', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <PatientList />
      </MemoryRouter>
    );
  });
});
