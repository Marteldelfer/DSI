// GARANTA QUE ESTE ARQUIVO EXISTA EM: aplicativo/babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // ESTA LINHA É A MAIS IMPORTANTE DE TODAS
    plugins: ['react-native-reanimated/plugin'],
  };
};