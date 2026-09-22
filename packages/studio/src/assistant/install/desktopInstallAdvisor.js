import { detectDeviceProfile } from './deviceProfiles.js';

const DEFAULT_OPTIONS = {
  ios: {
    autoInstallAvailable: false,
    recommendedPath: 'manual_add_to_home_screen',
    instructions: [
      'Open the app in Safari.',
      'Tap Share.',
      'Tap "Add to Home Screen".',
      'Tap Add to install the app icon.',
    ],
  },
  android: {
    autoInstallAvailable: true,
    recommendedPath: 'pwa_install_prompt',
    instructions: [
      'Open the app in Chrome.',
      'Accept the install prompt when shown.',
      'If prompt is missing, open browser menu and tap "Install app".',
    ],
  },
  windows: {
    autoInstallAvailable: true,
    recommendedPath: 'browser_or_native_installer',
    instructions: [
      'Use Edge/Chrome install icon in the address bar.',
      'Or use native desktop installer when published.',
    ],
  },
  macos: {
    autoInstallAvailable: true,
    recommendedPath: 'browser_or_native_installer',
    instructions: [
      'Use Safari/Chrome app install action if available.',
      'Or use native macOS installer when published.',
    ],
  },
  linux: {
    autoInstallAvailable: true,
    recommendedPath: 'browser_or_native_installer',
    instructions: [
      'Use browser install option for the web app.',
      'Or install native package (.deb/.rpm/AppImage) when published.',
    ],
  },
  chromeos: {
    autoInstallAvailable: true,
    recommendedPath: 'pwa_install_prompt',
    instructions: [
      'Open in Chrome.',
      'Use install prompt or install icon to add app to launcher.',
    ],
  },
  unknown: {
    autoInstallAvailable: false,
    recommendedPath: 'manual_browser_install',
    instructions: [
      'Open in a modern browser.',
      'Use browser menu to find "Install app" or "Add to Home Screen".',
    ],
  },
};

export function createDesktopInstallAdvisor({
  appName = 'Karma',
  installLinks = {},
  auditLogger,
} = {}) {
  return {
    getInstallOptions({ userAgent = '', supportsInstallPrompt = false } = {}) {
      const deviceProfile = detectDeviceProfile(userAgent);
      const profileOptions = DEFAULT_OPTIONS[deviceProfile] || DEFAULT_OPTIONS.unknown;
      const nativeLink = installLinks[deviceProfile] || null;
      const autoInstallEnabled = Boolean(
        profileOptions.autoInstallAvailable && (supportsInstallPrompt || nativeLink),
      );

      const result = {
        appName,
        deviceProfile,
        autoInstallEnabled,
        recommendedPath: profileOptions.recommendedPath,
        nativeInstallerUrl: nativeLink,
        instructions: profileOptions.instructions,
        notes:
          deviceProfile === 'ios'
            ? 'iOS does not allow silent automatic desktop app downloads from the browser.'
            : null,
      };

      auditLogger?.log?.({
        type: 'install.options.generated',
        deviceProfile,
        autoInstallEnabled,
      });

      return result;
    },
  };
}

