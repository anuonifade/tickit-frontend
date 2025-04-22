import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import QuestionList from '../QuestionList';

describe('QuestionList', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <QuestionList />
      </MemoryRouter>
    );
  });
});
