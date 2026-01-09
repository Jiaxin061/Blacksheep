const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add resolver to alias expo-router to our mock
// This uses both alias and extraNodeModules for maximum compatibility
config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    ...config.resolver?.extraNodeModules,
    'expo-router': path.resolve(__dirname, 'src/utils/mockExpoRouter.js'),
  },
  alias: {
    ...config.resolver?.alias,
    'expo-router': path.resolve(__dirname, 'src/utils/mockExpoRouter.js'),
  },
};

module.exports = config;

