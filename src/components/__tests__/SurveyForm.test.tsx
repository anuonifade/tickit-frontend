import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import SurveyForm from '../SurveyForm';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('SurveyForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<SurveyForm />);
    expect(screen.getByLabelText(/How are you feeling/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Stress level/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Sleep hours/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Describe your symptoms/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    render(<SurveyForm />);
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(await screen.findAllByText(/required/i)).toHaveLength(4);
  });

  it('submits valid form and shows confirmation', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { message: 'Success' } });
    render(<SurveyForm />);
    fireEvent.change(screen.getByLabelText(/How are you feeling/i), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText(/Stress level/i), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/Sleep hours/i), { target: { value: '7' } });
    fireEvent.change(screen.getByLabelText(/Describe your symptoms/i), { target: { value: 'Headache' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(await screen.findByText(/thank you/i)).toBeInTheDocument();
    expect(mockedAxios.post).toHaveBeenCalled();
  });

  it('handles API errors gracefully', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Internal Server Error'));
    render(<SurveyForm />);
    fireEvent.change(screen.getByLabelText(/How are you feeling/i), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText(/Stress level/i), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/Sleep hours/i), { target: { value: '7' } });
    fireEvent.change(screen.getByLabelText(/Describe your symptoms/i), { target: { value: 'Headache' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(await screen.findByText(/error submitting survey/i)).toBeInTheDocument();
  });
});
