export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.spec.ts'],
  moduleNameMapper: {
    '^@yape/shared$': '<rootDir>/../../packages/shared/dist/index.js'
  }
};
