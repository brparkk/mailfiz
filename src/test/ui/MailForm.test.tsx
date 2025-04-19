/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import MailForm from '../../components/ui/MailForm';
import * as apiModule from '../../lib/api';
import * as utilsModule from '../../lib/utils';

// Mock API functions first
vi.mock('../../lib/api', () => ({
  generateText: vi.fn().mockResolvedValue('Generated email content'),
  generateEmailSummary: vi.fn().mockResolvedValue('Generated summary'),
}));

vi.mock('../../lib/utils', () => ({
  cn: vi.fn((...args) => args.filter(Boolean).join(' ')),
  getBrowserLanguage: vi.fn().mockReturnValue('en'),
  getEmailContentFromGmail: vi.fn().mockResolvedValue({
    success: true,
    content: 'Email content from Gmail',
  }),
  sendToGmail: vi.fn().mockResolvedValue({ success: true }),
}));

describe('MailForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form elements correctly', async () => {
    await act(async () => {
      render(<MailForm />);
    });

    expect(screen.getByText('Mailfiz')).toBeInTheDocument();
    expect(screen.getByText('API Key')).toBeInTheDocument();
    expect(screen.getByText('Email Summary')).toBeInTheDocument();
    expect(screen.getByText('Create Email Draft')).toBeInTheDocument();
    expect(screen.getByText('Select tone')).toBeInTheDocument();
    expect(screen.getByText('Select language')).toBeInTheDocument();
    expect(screen.getByText('Generate')).toBeInTheDocument();
  });

  it('loads API key from storage on mount', async () => {
    await act(async () => {
      render(<MailForm />);
    });

    // Check if chrome.storage.sync.get was called
    expect(chrome.storage.sync.get).toHaveBeenCalled();
  });

  it('changes tone when buttons are clicked', async () => {
    await act(async () => {
      render(<MailForm />);
    });

    // Default tone should be selected initially
    let defaultButton = screen.getByText('default');
    expect(defaultButton.classList.contains('active')).toBeTruthy();

    // Click on professional tone
    let professionalButton = screen.getByText('professional');
    await act(async () => {
      fireEvent.click(professionalButton);
    });

    // Professional tone should be selected now
    expect(professionalButton.classList.contains('active')).toBeTruthy();

    // Click on casual tone
    let casualButton = screen.getByText('casual');
    await act(async () => {
      fireEvent.click(casualButton);
    });

    // Casual tone should be selected now
    expect(casualButton.classList.contains('active')).toBeTruthy();
  });

  it('toggles language dropdown when selector is clicked', async () => {
    await act(async () => {
      render(<MailForm />);
    });

    // Language dropdown should be closed initially
    expect(screen.queryByText('Korean')).not.toBeInTheDocument();

    // Click on the language selector
    const languageButton = screen.getByRole('button', { name: /English/i });
    await act(async () => {
      fireEvent.click(languageButton);
    });

    // Language dropdown should be open now with Korean option
    expect(screen.getByText('Korean')).toBeInTheDocument();
  });

  it('generates email when form is submitted', async () => {
    await act(async () => {
      render(<MailForm />);
    });

    // Get the textarea and fill it
    const textarea = screen.getByPlaceholderText(
      'Enter your rough draft here...'
    );
    await act(async () => {
      fireEvent.change(textarea, {
        target: { value: 'This is a test email draft' },
      });
    });

    // Get and click the generate button
    const generateButton = screen.getByRole('button', { name: /Generate/i });
    await act(async () => {
      fireEvent.click(generateButton);
    });

    // Check if generateText was called
    await waitFor(() => {
      expect(apiModule.generateText).toHaveBeenCalled();
    });
  });

  it('handles API errors correctly', async () => {
    // Mock API to throw an error
    vi.mocked(apiModule.generateText).mockRejectedValueOnce(
      new Error('API error')
    );

    await act(async () => {
      render(<MailForm />);
    });

    // Get the textarea and fill it
    const textarea = screen.getByPlaceholderText(
      'Enter your rough draft here...'
    );
    await act(async () => {
      fireEvent.change(textarea, {
        target: { value: 'This is a test email draft' },
      });
    });

    // Get and click the generate button
    const generateButton = screen.getByRole('button', { name: /Generate/i });
    await act(async () => {
      fireEvent.click(generateButton);
    });

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/오류가 발생했습니다/)).toBeInTheDocument();
    });
  });

  it('sends email to Gmail when email is generated', async () => {
    await act(async () => {
      render(<MailForm />);
    });

    // Get the textarea and fill it
    const textarea = screen.getByPlaceholderText(
      'Enter your rough draft here...'
    );
    await act(async () => {
      fireEvent.change(textarea, {
        target: { value: 'This is a test email draft' },
      });
    });

    // Get and click the generate button
    const generateButton = screen.getByRole('button', { name: /Generate/i });
    await act(async () => {
      fireEvent.click(generateButton);
    });

    // Check if sendToGmail was called
    await waitFor(() => {
      expect(utilsModule.sendToGmail).toHaveBeenCalled();
    });
  });
});
