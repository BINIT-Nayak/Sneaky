module.exports = {
  clearMocks: true,
  moduleNameMapper: {
    "\\.(css|scss)$": "identity-obj-proxy",
    "\\.(avif|webp|png|jpg|jpeg|gif|svg)$": "<rootDir>/src/test/fileMock.ts",
    "^.*services/userAPI$": "<rootDir>/src/test/userApiMock.ts",
    "^.*store/fetchAPI/.*$": "<rootDir>/src/test/fetchApiMock.ts",
  },
  preset: "ts-jest",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/src/**/*.test.{ts,tsx}"],
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: "tsconfig.jest.json" }],
  },
};
