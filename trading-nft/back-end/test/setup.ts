import { config } from 'dotenv';
import '@jest/globals';

// Load environment variables from .env file
config();

// Set test environment
process.env.NODE_ENV = 'test';

// Add any global test setup here
beforeAll(() => {
  // Global setup before all tests
});

afterAll(() => {
  // Global cleanup after all tests
});

// Reset mocks after each test
afterEach(() => {
  jest.resetAllMocks();
  jest.clearAllMocks();
}); 