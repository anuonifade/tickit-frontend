import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import QuestionTemplateList from '../QuestionTemplateList';

describe('QuestionTemplateList', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <QuestionTemplateList />
      </MemoryRouter>
    );
  });
});
