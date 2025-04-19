import '@testing-library/jest-dom';
import { vi } from 'vitest';

// jest-dom adds custom jest matchers for asserting on DOM nodes
// allows you to do things like:
// expect(element).toHaveTextContent('foo')
// learn more: https://github.com/testing-library/jest-dom

// Define Chrome mock for all tests
Object.defineProperty(global, 'chrome', {
  value: {
    storage: {
      sync: {
        get: vi
          .fn()
          .mockImplementation(() =>
            Promise.resolve({ apiKey: 'test-api-key' })
          ),
        set: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    },
    tabs: {
      query: vi
        .fn()
        .mockImplementation(() =>
          Promise.resolve([
            { id: 123, url: 'https://mail.google.com/mail/u/0/#inbox' },
          ])
        ),
      sendMessage: vi
        .fn()
        .mockImplementation(() => Promise.resolve({ success: true })),
    },
    runtime: {
      sendMessage: vi.fn().mockImplementation(() => Promise.resolve()),
    },
  },
  writable: true,
});
