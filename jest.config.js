module.exports = {
  preset: '@react-native/jest-preset',
  transformIgnorePatterns: [
    'node_modules/(?!((@react-native|@react-navigation|@react-native-firebase|@react-native-async-storage|react-native|react-native-.*)/))',
  ],
};
