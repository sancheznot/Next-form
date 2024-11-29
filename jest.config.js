const nextJest = require('next/jest')
const path = require('path')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  projects: [
    {
      displayName: 'SETUP',
      testMatch: ['<rootDir>/__tests__/setup.test.js'],
      testEnvironment: 'jest-environment-jsdom',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@test-utils$': '<rootDir>/__tests__/test-utils.js'
      },
      transform: {
        '^.+\\.(js|jsx|ts|tsx|mjs)$': ['@swc/jest', {
          jsc: {
            parser: {
              jsx: true,
              syntax: 'ecmascript'
            }
          }
        }]
      }
    },
    {
      displayName: 'UI',
      testMatch: ['<rootDir>/__tests__/ui/**/*.test.js'],
      testEnvironment: 'jest-environment-jsdom',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      moduleNameMapper: {
        '^@/components/(.*)$': '<rootDir>/src/components/$1',
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@@/(.*)$': '<rootDir>/public/$1',
        '^@test-utils$': '<rootDir>/__tests__/test-utils.js',
        '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
      },
      transform: {
        '^.+\\.(js|jsx|ts|tsx|mjs)$': ['@swc/jest', {
          jsc: {
            parser: {
              jsx: true,
              syntax: 'ecmascript'
            },
            transform: {
              react: {
                runtime: 'automatic'
              }
            }
          }
        }]
      },
      transformIgnorePatterns: [
        '/node_modules/(?!(some-esm-package)/)', // Add any ESM packages that need to be transformed
      ],
    },
    {
      displayName: 'API/DB',
      testMatch: ['<rootDir>/__tests__/api/**/*.test.js'],
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1'
      },
      transform: {
        '^.+\\.(js|jsx|ts|tsx|mjs)$': ['@swc/jest']
      }
    }
  ]
}

module.exports = createJestConfig(customJestConfig)