import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ErrorDisplay from '../../../components/common/ErrorDisplay';

describe('ErrorDisplay', () => {
  it('should render unauthorized error with login button', () => {
    render(
      <MemoryRouter>
        <ErrorDisplay type="unauthorized" />
      </MemoryRouter>
    );

    // Check for login button which is unique to unauthorized error
    const loginButton = screen.getByRole('link', { name: /go to login/i });
    expect(loginButton).toBeInTheDocument();
    expect(loginButton.getAttribute('href')).toBe('/admin/login');
    
    // Check for the message text
    expect(screen.getByText(/need to be logged in/i)).toBeInTheDocument();
  });

  it('should render forbidden error with dashboard button', () => {
    render(
      <MemoryRouter>
        <ErrorDisplay type="forbidden" />
      </MemoryRouter>
    );

    // Check for dashboard button which is unique to forbidden error
    const dashboardButton = screen.getByRole('link', { name: /return to dashboard/i });
    expect(dashboardButton).toBeInTheDocument();
    expect(dashboardButton.getAttribute('href')).toBe('/admin/dashboard');
    
    // Check for the message text
    expect(screen.getByText(/do not have permission/i)).toBeInTheDocument();
  });

  it('should render general error with error message', () => {
    render(
      <MemoryRouter>
        <ErrorDisplay type="error" />
      </MemoryRouter>
    );

    // Check for error message
    expect(screen.getByText(/processing your request/i)).toBeInTheDocument();
  });
  
  it('should render custom error message when provided', () => {
    const customMessage = 'This is a custom error message';
    render(
      <MemoryRouter>
        <ErrorDisplay type="error" message={customMessage} />
      </MemoryRouter>
    );

    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });


  // Removed duplicate test

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
