import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.template.app',
  appName: 'template',
  webDir: "public",
  server: {
    url: "RouteToYourServer",
    cleartext: false,
  },
};

export default config;
