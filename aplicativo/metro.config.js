// aplicativo/metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Necessário para compatibilidade do Firebase com Metro
config.resolver.sourceExts.push('cjs');

// Desabilita package exports para compatibilidade com Firebase e outras libs
// Mantenha false enquanto usar firebase v12 no React Native
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
