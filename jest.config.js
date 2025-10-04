// jest.config.js
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: [
    "**/__tests__/**/*.test.ts",
    "**/tests/**/*.test.ts", // ← Añade esto
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};
