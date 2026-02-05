const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.jest.json',
      },
    ],
  },
  moduleNameMapper: {
    '^nanoid$': '<rootDir>/src/test/__mocks__/nanoid.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  clearMocks: true,
}

export default config
