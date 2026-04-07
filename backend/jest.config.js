export default {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/app.js',
    '!**/node_modules/**',
  ],
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/tests/**/*.test.js', '**/?(*.)+(spec|test).js'],
  transformIgnorePatterns: ['node_modules/(?!([@a-zA-Z0-9_-]+)/)'],
  testTimeout: 10000,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
};
