module.exports = {
  preset: 'react-native',
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-drawer-layout|react-native-safe-area-context|react-native-screens|react-native-gesture-handler|react-native-reanimated|@react-native-firebase|@react-native-google-signin)/)',
  ],
  setupFiles: ['./jest.setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '/backend/'],
};
