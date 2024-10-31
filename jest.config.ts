import { Config } from "jest";

const config: Config = {
  preset: "ts-jest", // Use ts-jest preset for TypeScript
  testEnvironment: "node", // Set the test environment to Node.js
  moduleFileExtensions: ["js", "ts"], // Specify the file extensions Jest will look for
  testMatch: ["**/tests/**/*.test.ts"], // Specify where to find test files
  transform: {
    "^.+\\.tsx?$": "ts-jest", // Use ts-jest to transpile TypeScript files
  },
  collectCoverage: true, // Collect coverage information
  coverageDirectory: "coverage", // Output directory for coverage reports
  coverageProvider: "v8", // Use the V8 coverage provider
  verbose: true, // Show detailed results
};

export default config;
