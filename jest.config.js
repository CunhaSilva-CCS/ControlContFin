// Set before any worker spawns so Date's local-time methods (getFullYear,
// getMonth, getDate — used by src/utils/date.ts) reflect this app's actual
// target timezone (Brazil, UTC-3) instead of whatever TZ the CI/dev machine
// defaults to (often UTC). Also lets tests catch local-vs-UTC date bugs that
// are invisible when the test runner happens to run in UTC.
process.env.TZ = 'America/Sao_Paulo';

module.exports = {
  preset: 'jest-expo',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@noble/.*)',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/.expo/'],
};
