import type { Config } from "jest";

const config: Config = {
  // Use ts-jest to handle TypeScript files
  preset: "ts-jest",

  // Run in Node environment (no jsdom needed for API/model tests)
  testEnvironment: "node",

  // Enable coverage collection by default
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["lcov", "text", "html"],

  // Only collect coverage from meaningful source files
  collectCoverageFrom: [
    "app/**/*.{ts,tsx}",
    "lib/**/*.{ts,tsx}",
    "models/**/*.ts",
    "middleware/**/*.ts",
    "components/**/*.{ts,tsx}",
    "!**/__tests__/**",
    "!**/*.test.{ts,tsx}",
    "!**/node_modules/**",
    "!**/.next/**",
    "!**/prisma/**",
  ],

  // Test discovery
  testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],

  // Path aliases matching tsconfig.json
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },

  // ts-jest options
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react",
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
        },
      },
    ],
  },

  // Files to run before each test suite
  setupFilesAfterEnv: [],

  // Ignore patterns
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],
  modulePathIgnorePatterns: ["/.next/"],

  // Verbose output
  verbose: true,

  // Clear mocks between tests automatically
  clearMocks: true,
  restoreMocks: true,

  // Timeout per test (ms)
  testTimeout: 10000,
};

export default config;
