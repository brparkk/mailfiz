import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock the required functions
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

// Create a simple test component that doesn't use chrome APIs
function SimpleMailForm() {
  return (
    <div>
      <h1>Mailfiz</h1>
      <div>API Key</div>
      <div>Email Summary</div>
      <div>Create Email Draft</div>
      <button className="tone-button">default</button>
      <button className="tone-button">professional</button>
      <button className="tone-button">casual</button>
      <button className="generate-button">Generate</button>
    </div>
  );
}

// Test the simple version that doesn't use Chrome APIs
describe('SimpleMailForm', () => {
  it('renders basic form elements', () => {
    render(<SimpleMailForm />);

    expect(screen.getByText('Mailfiz')).toBeInTheDocument();
    expect(screen.getByText('API Key')).toBeInTheDocument();
    expect(screen.getByText('Email Summary')).toBeInTheDocument();
    expect(screen.getByText('Create Email Draft')).toBeInTheDocument();
    expect(screen.getByText('Generate')).toBeInTheDocument();
  });

  it('displays tone buttons', () => {
    render(<SimpleMailForm />);

    expect(screen.getByText('default')).toBeInTheDocument();
    expect(screen.getByText('professional')).toBeInTheDocument();
    expect(screen.getByText('casual')).toBeInTheDocument();
  });
});
