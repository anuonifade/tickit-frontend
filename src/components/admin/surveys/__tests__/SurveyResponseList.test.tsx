import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SurveyResponseList from '../SurveyResponseList';

describe('SurveyResponseList', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <SurveyResponseList />
      </MemoryRouter>
    );
  });
});
