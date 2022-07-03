/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts'],
  coverageThreshold: {
    './src': {
      branches: 60,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  modulePathIgnorePatterns: ['src/types/'],
};
