import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ConfirmDialog from '../ConfirmDialog';

describe('ConfirmDialog', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <ConfirmDialog open={false} onClose={() => {}} onConfirm={() => {}} title="Test" message="Are you sure?" />
      </MemoryRouter>
    );
  });
});
