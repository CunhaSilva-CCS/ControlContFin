const { withEntitlementsPlist } = require('expo/config-plugins');

const baseConfig = require('./app.json');

/**
 * `expo-notifications`' config plugin unconditionally adds the
 * `aps-environment` (Push Notifications) entitlement on iOS, even though this
 * app only ever schedules LOCAL notifications (see src/services/notifications.ts
 * — no push token is requested anywhere). That entitlement requires a paid
 * Apple Developer Program membership to provision, which blocks builds signed
 * with a free personal team. Since it's not needed, strip it back out here.
 */
function withoutPushNotificationsEntitlement(config) {
  return withEntitlementsPlist(config, (config) => {
    delete config.modResults['aps-environment'];
    return config;
  });
}

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
module.exports = withoutPushNotificationsEntitlement({
  ...baseConfig.expo,
  plugins: pluginsForBuild(baseConfig.expo.plugins),
});
