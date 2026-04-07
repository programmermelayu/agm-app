export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['**/tests/**/*.test.js', '**/__tests__/**/*.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
  ],
  testTimeout: 10000,
  verbose: true,
};
