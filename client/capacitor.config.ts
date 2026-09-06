import type { CapacitorConfig } from '@capacitor/cli'

const devServerUrl = process.env.DEV_SERVER_URL

const config: CapacitorConfig = {
  appId: 'com.financetracker.app',
  appName: 'Finances Tracker',
  webDir: 'dist',
  server: devServerUrl
    ? {
        url: devServerUrl,
        cleartext: true,
      }
    : undefined,
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
  },
}

export default config
