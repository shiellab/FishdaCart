const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration - Optimized for Windows
 */
const config = {
  maxWorkers: 1,
  resetCache: false,
  
  resolver: {
    useWatchman: false,
    // Aggressive blocking to reduce file scanning
    blockList: [
      /node_modules\/.*\/node_modules\/.*/,
      /.*\.git\/.*/,
      /android\/.*/,
      /ios\/.*/,
      /backend\/.*/,
      /.*\.test\.(js|jsx|ts|tsx)$/,
      /.*\/__tests__\/.*/,
    ],
  },
  
  transformer: {
    enableBabelRCLookup: false,
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
