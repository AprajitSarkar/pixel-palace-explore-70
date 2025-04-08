
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.3306f663ce8c417fa46b7ed22e1d99de',
  appName: 'pixel-palace-explore',
  webDir: 'dist',
  server: {
    url: 'https://3306f663-ce8c-417f-a46b-7ed22e1d99de.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false
    },
    // Add AdMob configuration that will be used by the plugin
    AdMob: {
      appId: 'ca-app-pub-3279473081670891~1431437217',
      testingDevices: [],
      initializeForTesting: true
    }
  },
  // Android-specific configurations
  android: {
    // Add any Android-specific configuration here
  }
};

export default config;
