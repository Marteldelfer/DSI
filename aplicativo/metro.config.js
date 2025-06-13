// aplicativo/metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Adicione estas configurações para resolver problemas de módulo com o Firebase
config.resolver.sourceExts.push('cjs');
config.resolver.unstable_enablePackageExports = false; // Esta linha é importante para algumas versões do Firebase

module.exports = config;