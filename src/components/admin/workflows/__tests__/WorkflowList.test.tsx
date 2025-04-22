import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import WorkflowList from '../WorkflowList';

describe('WorkflowList', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <WorkflowList />
      </MemoryRouter>
    );
  });
});
