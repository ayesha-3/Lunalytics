import '@testing-library/jest-dom';

// ========================================
// 1. Polyfill for TextEncoder/TextDecoder
// ========================================
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// ========================================
// 2. Mock react-toastify
// ========================================
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}));

// ========================================
// 3. Suppress React act() warnings
// ========================================
const originalError = console.error;
const originalWarning = console.warn;

beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: An update to') &&
      args[0].includes('was not wrapped in act')
    ) return;
    originalError.call(console, ...args);
  };

  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('componentWillReceiveProps')
    ) return;
    originalWarning.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarning;
});

// ========================================
// 4. Mock IntersectionObserver
// ========================================
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() { return []; }
  unobserve() {}
};

// ========================================
// Note: window.location is NOT mocked here.
// Mock window.location methods inside specific tests using jest.spyOn
// ========================================
