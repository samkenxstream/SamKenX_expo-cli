/**
 * These are the versioned first-party plugins with some of the future third-party plugins mixed in for legacy support.
 */
import { ExpoConfig } from '@expo/config-types';

import { ConfigPlugin, StaticPlugin } from '../Plugin.types';
import * as AndroidConfig from '../android';
import * as IOSConfig from '../ios';
import withAdMob from './unversioned/expo-ads-admob';
import withAppleAuthentication from './unversioned/expo-apple-authentication';
import withBranch from './unversioned/expo-branch';
import withContacts from './unversioned/expo-contacts';
import withDocumentPicker from './unversioned/expo-document-picker';
import withFacebook from './unversioned/expo-facebook';
import withNotifications from './unversioned/expo-notifications';
import withSplashScreen from './unversioned/expo-splash-screen';
import withUpdates from './unversioned/expo-updates';
import withMaps from './unversioned/react-native-maps';
import { withPlugins } from './withPlugins';
import { withStaticPlugin } from './withStaticPlugin';

/**
 * Config plugin to apply all of the custom Expo iOS config plugins we support by default.
 * TODO: In the future most of this should go into versioned packages like expo-facebook, expo-updates, etc...
 */
export const withExpoIOSPlugins: ConfigPlugin<{
  bundleIdentifier: string;
}> = (config, { bundleIdentifier }) => {
  // Set the bundle ID ahead of time.
  if (!config.ios) config.ios = {};
  config.ios.bundleIdentifier = bundleIdentifier;

  return withPlugins(config, [
    [IOSConfig.BundleIdentifier.withBundleIdentifier, { bundleIdentifier }],
    IOSConfig.Swift.withSwiftBridgingHeader,
    IOSConfig.Swift.withNoopSwiftFile,
    IOSConfig.Google.withGoogle,
    IOSConfig.Name.withDisplayName,
    IOSConfig.Orientation.withOrientation,
    IOSConfig.RequiresFullScreen.withRequiresFullScreen,
    IOSConfig.Scheme.withScheme,
    IOSConfig.UserInterfaceStyle.withUserInterfaceStyle,
    IOSConfig.UsesNonExemptEncryption.withUsesNonExemptEncryption,
    IOSConfig.Version.withBuildNumber,
    IOSConfig.Version.withVersion,
    IOSConfig.Google.withGoogleServicesFile,
    // Entitlements
    IOSConfig.Entitlements.withAssociatedDomains,
    // XcodeProject
    IOSConfig.DeviceFamily.withDeviceFamily,
    IOSConfig.Locales.withLocales,
    // Dangerous
    IOSConfig.Icons.withIcons,
  ]);
};

/**
 * Config plugin to apply all of the custom Expo Android config plugins we support by default.
 * TODO: In the future most of this should go into versioned packages like expo-facebook, expo-updates, etc...
 */
export const withExpoAndroidPlugins: ConfigPlugin<{
  package: string;
}> = (config, props) => {
  // Set the package name ahead of time.
  if (!config.android) config.android = {};
  config.android.package = props.package;

  return withPlugins(config, [
    // settings.gradle
    AndroidConfig.Name.withNameSettingsGradle,

    // project build.gradle
    AndroidConfig.GoogleServices.withClassPath,

    // app/build.gradle
    AndroidConfig.GoogleServices.withApplyPlugin,
    AndroidConfig.Package.withPackageGradle,
    AndroidConfig.Version.withVersion,

    // AndroidManifest.xml
    AndroidConfig.Package.withPackageManifest,
    AndroidConfig.AllowBackup.withAllowBackup,
    // Note: The withAndroidIntentFilters plugin must appear before the withScheme
    // plugin or withScheme will override the output of withAndroidIntentFilters.
    AndroidConfig.IntentFilters.withAndroidIntentFilters,
    AndroidConfig.Scheme.withScheme,
    AndroidConfig.Orientation.withOrientation,
    AndroidConfig.Permissions.withPermissions,
    AndroidConfig.UserInterfaceStyle.withUiModeManifest,

    // MainActivity.*
    AndroidConfig.UserInterfaceStyle.withUiModeMainActivity,

    // strings.xml
    AndroidConfig.Name.withName,

    // Dangerous -- these plugins run in reverse order.
    AndroidConfig.GoogleServices.withGoogleServicesFile,

    // Modify colors.xml and styles.xml
    AndroidConfig.RootViewBackgroundColor.withRootViewBackgroundColor,
    AndroidConfig.NavigationBar.withNavigationBar,
    AndroidConfig.StatusBar.withStatusBar,
    AndroidConfig.PrimaryColor.withPrimaryColor,

    AndroidConfig.Icon.withIcons,
    // If we renamed the package, we should also move it around and rename it in source files
    // Added last to ensure this plugin runs first. Out of tree solutions will mistakenly resolve the package incorrectly otherwise.
    AndroidConfig.Package.withPackageRefactor,
  ]);
};

export const withExpoVersionedSDKPlugins: ConfigPlugin<{ expoUsername: string | null }> = (
  config,
  { expoUsername }
) => {
  return withPlugins(config, [
    withMaps,
    withAdMob,
    withAppleAuthentication,
    withContacts,
    withNotifications,
    [withUpdates, { expoUsername }],
    withBranch,
    withDocumentPicker,
    withFacebook,
    withSplashScreen,
  ]);
};

export function getExpoLegacyPlugins() {
  return expoLegacyPlugins;
}

// Expo managed packages that require extra update.
// These get applied automatically to create parity with expo build in eas build.
const expoLegacyPlugins = [
  'expo-app-auth',
  'expo-av',
  'expo-background-fetch',
  'expo-barcode-scanner',
  'expo-brightness',
  'expo-calendar',
  'expo-camera',
  'expo-dev-menu',
  'expo-dev-launcher',
  'expo-dev-client',
  'expo-image-picker',
  'expo-file-system',
  'expo-ads-facebook',
  'expo-location',
  'expo-media-library',
  'expo-screen-orientation',
  'expo-sensors',
  'expo-task-manager',
  'expo-local-authentication',
];

// Plugins that need to be automatically applied, but also get applied by expo-cli if the versioned plugin isn't available.
// These are split up because the user doesn't need to be prompted to setup these packages.
const expoManagedVersionedPlugins = [
  'expo-firebase-analytics',
  'expo-firebase-core',
  'expo-google-sign-in',
];

const withOptionalLegacyPlugins: ConfigPlugin<(StaticPlugin | string)[]> = (config, plugins) => {
  return plugins.reduce((prev, plugin) => {
    return withStaticPlugin(prev, {
      // hide errors
      _isLegacyPlugin: true,
      plugin,
      // If a plugin doesn't exist, do nothing.
      fallback: config => config,
    });
  }, config);
};

export function withExpoLegacyPlugins(config: ExpoConfig) {
  return withOptionalLegacyPlugins(config, [
    ...new Set(expoManagedVersionedPlugins.concat(expoLegacyPlugins)),
  ]);
}
