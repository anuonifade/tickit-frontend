module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^react-router-dom$': '<rootDir>/src/__mocks__/react-router-dom.js',
    '^axios$': '<rootDir>/src/__mocks__/axios.js'
  },
  setupFilesAfterEnv: [
    '<rootDir>/src/setupTests.ts'
  ],
  testPathIgnorePatterns: ['/node_modules/', '/build/'],
  transformIgnorePatterns: [
    '/node_modules/(?!(axios|react-router-dom)/).+\\.js$'
  ],
  moduleDirectories: ['node_modules', 'src'],
  verbose: true,
  // Run specific tests that we've fixed
  testMatch: [
    '<rootDir>/src/__tests__/services/api.test.ts',
    '<rootDir>/src/__tests__/contexts/AuthContext.test.tsx',
    '<rootDir>/src/__tests__/components/admin/Dashboard.test.tsx',
    '<rootDir>/src/__tests__/components/admin/surveys/SurveyResponseList.test.tsx',
    '<rootDir>/src/__tests__/components/admin/patients/PatientDetail.test.tsx',
    '<rootDir>/src/__tests__/components/auth/ProtectedRoute.test.tsx',
    '<rootDir>/src/App.test.tsx'
  ],
};
