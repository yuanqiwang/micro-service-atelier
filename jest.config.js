module.exports = {
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  projects: [
    {
      displayName: 'dom',
      testEnvironment: 'jsdom',
      testMatch: ["**/*.test.jsx"]
    },
    {
      displayName: 'node',
      testEnvironment: 'node',
      testMatch: ['**/*.test.js']
    },
  ],
};