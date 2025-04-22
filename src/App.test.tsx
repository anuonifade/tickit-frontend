import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders without crashing', () => {
  // Just test that the app renders without crashing
  const { container } = render(<App />);
  expect(container).toBeInTheDocument();
});
