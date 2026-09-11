import type { CapacitorConfig } from '@capacitor/cli'

const devServerUrl = process.env.DEV_SERVER_URL
const vercelUrl = 'https://finances-tracker-gilt.vercel.app'

const config: CapacitorConfig = {
  appId: 'com.financetracker.app',
  appName: 'Finances Tracker',
  webDir: 'dist',
  server: devServerUrl
    ? {
        url: devServerUrl,
        cleartext: true,
      }
    : {
        url: vercelUrl,
        errorPath: 'index.html',
      },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
    LocalNotifications: {
      presentationOptions: ['badge', 'sound', 'banner', 'list'],
    },
  },
}

export default config
