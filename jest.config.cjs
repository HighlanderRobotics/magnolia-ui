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
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@highlanderrobotics/magnolia-tokens/v2$':
      '<rootDir>/packages/tokens/dist/v2.js',
    '^@highlanderrobotics/magnolia-tokens$':
      '<rootDir>/packages/tokens/dist/index.js',
  },
  maxWorkers: 2,
};
