const googleServicesFile = process.env.GOOGLE_SERVICES_JSON || './google-services.json'

module.exports = {
  expo: {
    name: 'Navrang',
    slug: 'mobile',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'navrang',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
    },
    android: {
      usesCleartextTraffic: true,
      permissions: [
        'android.permission.POST_NOTIFICATIONS',
      ],
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: 'com.navrang.mobile',
      googleServicesFile,
    },
    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      'expo-notifications',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: {
            backgroundColor: '#000000',
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: '449b4037-c9c4-4423-b33b-88e081a807b4',
      },
    },
    owner: 'bhavesh0078',
    runtimeVersion: '1.0.0',
    updates: {
      url: 'https://u.expo.dev/449b4037-c9c4-4423-b33b-88e081a807b4',
    },
  },
}
