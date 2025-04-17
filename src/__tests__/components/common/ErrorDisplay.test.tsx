import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ErrorDisplay from '../../../components/common/ErrorDisplay';
import userEvent from '@testing-library/user-event';

describe('ErrorDisplay', () => {
  it('should render unauthorized error correctly', () => {
    render(
      <MemoryRouter>
        <ErrorDisplay type="unauthorized" />
      </MemoryRouter>
    );

    expect(screen.getByText('Authentication Required')).toBeInTheDocument();
    expect(screen.getByText('You need to be logged in to access this resource.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go to login/i })).toBeInTheDocument();
  });

  it('should render forbidden error correctly', () => {
    render(
      <MemoryRouter>
        <ErrorDisplay type="forbidden" />
      </MemoryRouter>
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText('You do not have permission to access this resource.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /return to dashboard/i })).toBeInTheDocument();
  });

  it('should render general error correctly', () => {
    render(
      <MemoryRouter>
        <ErrorDisplay type="error" />
      </MemoryRouter>
    );

    expect(screen.getByText('An Error Occurred')).toBeInTheDocument();
    expect(screen.getByText('There was an error processing your request.')).toBeInTheDocument();
  });

  it('should display custom error message when provided', () => {
    const customMessage = 'Custom error message for testing';
    render(
      <MemoryRouter>
        <ErrorDisplay type="error" message={customMessage} />
      </MemoryRouter>
    );

    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('should call onRetry when retry button is clicked', async () => {
    const handleRetry = jest.fn();
    render(
      <MemoryRouter>
        <ErrorDisplay type="error" onRetry={handleRetry} />
      </MemoryRouter>
    );

    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
    
    await userEvent.click(retryButton);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('should not show retry button when onRetry is not provided', () => {
    render(
      <MemoryRouter>
        <ErrorDisplay type="error" />
      </MemoryRouter>
    );

    expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
  });
});
