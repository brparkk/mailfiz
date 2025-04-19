import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { cn, sendToGmail, getBrowserLanguage } from '../lib/utils';

describe('cn function', () => {
  it('should merge class names correctly', () => {
    expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500');
    expect(cn('p-4', { 'font-bold': true, 'text-lg': false })).toBe(
      'p-4 font-bold'
    );
    expect(cn('mt-2', ['flex', 'items-center'])).toBe('mt-2 flex items-center');
  });

  it('should handle tailwind conflicts correctly', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    expect(cn('p-4 px-2', 'py-2')).toBe('p-4 px-2 py-2');
  });
});

describe('sendToGmail function', () => {
  // Mock Chrome API
  const mockTabs = {
    query: vi.fn(),
    sendMessage: vi.fn(),
  };

  beforeEach(() => {
    // Setup the mock without using global
    vi.stubGlobal('chrome', { tabs: mockTabs });
  });

  afterEach(() => {
    // Clear mocks between tests
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it('should successfully send text to Gmail tab', async () => {
    // Mock successful Chrome API responses
    mockTabs.query.mockResolvedValue([
      { id: 123, url: 'https://mail.google.com/mail/u/0/#inbox' },
    ]);
    mockTabs.sendMessage.mockResolvedValue({ success: true });

    const result = await sendToGmail('Test email content');

    // Verify the correct tab was queried
    expect(mockTabs.query).toHaveBeenCalledWith({
      active: true,
      currentWindow: true,
    });

    // Verify the message was sent to the correct tab with correct data
    expect(mockTabs.sendMessage).toHaveBeenCalledWith(123, {
      action: 'insertEmailText',
      text: 'Test email content',
    });

    // Verify the result is as expected
    expect(result).toEqual({ success: true });
  });

  it('should handle case when no tabs are found', async () => {
    // Mock empty tabs array
    mockTabs.query.mockResolvedValue([]);

    const result = await sendToGmail('Test email content');

    // Verify query was made but no message was sent
    expect(mockTabs.query).toHaveBeenCalled();
    expect(mockTabs.sendMessage).not.toHaveBeenCalled();

    // Verify error response
    expect(result).toEqual({
      success: false,
      error: '현재 활성화된 탭을 찾을 수 없습니다.',
    });
  });

  it('should handle case when active tab is not Gmail', async () => {
    // Mock non-Gmail tab
    mockTabs.query.mockResolvedValue([
      { id: 123, url: 'https://www.google.com' },
    ]);

    const result = await sendToGmail('Test email content');

    // Verify query was made but no message was sent
    expect(mockTabs.query).toHaveBeenCalled();
    expect(mockTabs.sendMessage).not.toHaveBeenCalled();

    // Verify error response
    expect(result).toEqual({
      success: false,
      error: 'Gmail이 열려있지 않습니다. Gmail을 열고 다시 시도해주세요.',
    });
  });

  it('should handle case when tab id is missing', async () => {
    // Mock tab without id
    mockTabs.query.mockResolvedValue([
      { url: 'https://mail.google.com/mail/u/0/#inbox' },
    ]);

    const result = await sendToGmail('Test email content');

    expect(mockTabs.query).toHaveBeenCalled();
    expect(mockTabs.sendMessage).not.toHaveBeenCalled();

    expect(result).toEqual({
      success: false,
      error: '탭 ID를 찾을 수 없습니다.',
    });
  });

  it('should handle message sending error', async () => {
    // Mock Gmail tab but sendMessage throws an error
    mockTabs.query.mockResolvedValue([
      { id: 123, url: 'https://mail.google.com/mail/u/0/#inbox' },
    ]);
    mockTabs.sendMessage.mockRejectedValue(new Error('Send error'));

    const result = await sendToGmail('Test email content');

    expect(mockTabs.query).toHaveBeenCalled();
    expect(mockTabs.sendMessage).toHaveBeenCalled();

    expect(result).toEqual({
      success: false,
      error: 'Send error',
    });
  });

  it('should handle case when sendMessage returns no response', async () => {
    // Mock Gmail tab but sendMessage returns undefined
    mockTabs.query.mockResolvedValue([
      { id: 123, url: 'https://mail.google.com/mail/u/0/#inbox' },
    ]);
    mockTabs.sendMessage.mockResolvedValue(undefined);

    const result = await sendToGmail('Test email content');

    expect(result).toEqual({
      success: false,
      error: '응답이 없습니다.',
    });
  });
});

describe('getBrowserLanguage function', () => {
  const originalNavigator = global.navigator;

  afterEach(() => {
    // Restore original navigator after each test
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
    });
  });

  it('should return the language code from navigator.language', () => {
    // Mock navigator with language property
    Object.defineProperty(global, 'navigator', {
      value: { language: 'ko-KR' },
      writable: true,
    });

    expect(getBrowserLanguage()).toBe('ko');
  });

  it('should return the language code from navigator.userLanguage (fallback)', () => {
    // Mock navigator with userLanguage property but no language property
    Object.defineProperty(global, 'navigator', {
      value: { userLanguage: 'en-US' },
      writable: true,
    });

    expect(getBrowserLanguage()).toBe('en');
  });

  it('should handle language codes without country code', () => {
    // Mock navigator with simple language code
    Object.defineProperty(global, 'navigator', {
      value: { language: 'fr' },
      writable: true,
    });

    expect(getBrowserLanguage()).toBe('fr');
  });
});
