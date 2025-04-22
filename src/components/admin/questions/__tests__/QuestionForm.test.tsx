import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import QuestionForm from '../QuestionForm';

describe('QuestionForm', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <QuestionForm />
      </MemoryRouter>
    );
  });
});
