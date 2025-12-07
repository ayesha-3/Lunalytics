module.exports = {
  testEnvironment: 'jsdom',
  
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  
  testMatch: ['**/?(*.)+(test|spec).ts?(x)'],
  
  // Helps Jest handle imports (especially in Vite projects)
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },

  // ========================================
  // NEW: Setup file for mocks and polyfills
  // ========================================
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // ========================================
  // NEW: Coverage configuration
  // ========================================
  collectCoverageFrom: [
    'src/**/*.{ts,tsx,js,jsx}',
    'app/**/*.{ts,tsx,js,jsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/main.jsx',
    '!src/vite-env.d.ts',
  ],

  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  coverageReporters: [
    'text',           // Console output
    'text-summary',   // Summary in console
    'html',           // HTML report for viewing
    'lcov',           // For CI/CD tools
    'json-summary',   // Machine-readable summary
  ],

  // ========================================
  // NEW: CI-specific settings
  // ========================================
  testTimeout: 10000,    // 10 seconds timeout
  maxWorkers: '50%',     // Use 50% of CPU cores

  // ========================================
  // NEW: Test result reporters (includes jest-junit)
  // ========================================
  reporters: [
    'default',           // Standard Jest reporter
    [
      'jest-junit',      // JUnit XML reporter for Jenkins
      {
        outputDirectory: '.',              // Output to project root
        outputName: 'junit.xml',           // Filename for Jenkins
        classNameTemplate: '{classname}',  // Test suite name
        titleTemplate: '{title}',          // Test case name
        ancestorSeparator: ' › ',          // Nested describe separator
        usePathForSuiteName: true,         // Use file path as suite name
      },
    ],
  ],

  // ========================================
  // OPTIONAL: Suppress console warnings in tests
  // ========================================
  // silent: false,  // Set to true to suppress console output
};