import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import QuestionTemplateForm from '../QuestionTemplateForm';

describe('QuestionTemplateForm', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <QuestionTemplateForm />
      </MemoryRouter>
    );
  });
});
