import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sarh.company',
  appName: 'صرح',
  webDir: 'out',
  ios: {
    contentInset: 'always',
  },
  plugins: {
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#1e3a34',
      overlaysWebView: false,
    },
  },
};

export default config;
