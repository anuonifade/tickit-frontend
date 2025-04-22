import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PatientForm from '../PatientForm';

describe('PatientForm', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <PatientForm />
      </MemoryRouter>
    );
  });
});
