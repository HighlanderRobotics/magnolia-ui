module.exports = {
  preset: 'react-native',
  testMatch: ['<rootDir>/tests/native/**/*.test.tsx'],
  transform: {
    '^.+\\.[jt]sx?$': [
      'babel-jest',
      { presets: ['module:@react-native/babel-preset'] },
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!((@)?react-native|@react-native|@react-native-community)/)',
  ],
  moduleNameMapper: {
    '^@highlanderrobotics/magnolia-tokens$':
      '<rootDir>/packages/tokens/dist/index.js',
  },
  maxWorkers: 2,
};
