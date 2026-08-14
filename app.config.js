const baseConfig = require('./app.json');

// EAS Build sets this automatically to the profile being built (see eas.json).
const isProductionBuild = process.env.EAS_BUILD_PROFILE === 'production';

/**
 * `expo-dev-client` (dev launcher/dev menu, remote bundle loading) has no
 * place in a release build — excluded here rather than relying on the
 * `developmentClient` flag in eas.json alone, since that flag controls how
 * the app boots but doesn't by itself strip the plugin's native surface from
 * the compiled binary.
 */
function pluginsForBuild(plugins) {
  if (!isProductionBuild) {
    return plugins;
  }
  return plugins.filter((plugin) => {
    const name = Array.isArray(plugin) ? plugin[0] : plugin;
    return name !== 'expo-dev-client';
  });
}

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  ...baseConfig.expo,
  plugins: pluginsForBuild(baseConfig.expo.plugins),
};
