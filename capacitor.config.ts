
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
    }
  },
  // Android-specific configurations
  android: {
    // You can add Android-specific configurations here when needed
  }
};

export default config;
