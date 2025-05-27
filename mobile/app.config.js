// app.config.js
import 'dotenv/config';

export default {
  expo: {
    name: "procuraai",
    slug: "mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/logo.png",
    scheme: "mobile",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
       bundleIdentifier: "com.procuraai.mobile"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/icons/favicon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      package: "com.procuraai.mobile"
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/icons/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/logo.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      router: {
        origin: false
      },
      eas: {
        projectId: "bacab517-fb1f-41f6-8e6d-12195a6274da"
      },

      // Variáveis de ambiente expostas ao app
      API_URL: process.env.EXPO_PUBLIC_API_URL,
      BASE_URL: process.env.EXPO_PUBLIC_BASE_URL,
      NEIGHBORHOODS_GEOJSON_URL: process.env.EXPO_PUBLIC_NEIGHBORHOODS_GEOJSON_URL,
      PARAIBA_GEOJSON_URL: process.env.EXPO_PUBLIC_PARAIBA_GEOJSON_URL,
      APP_WRITE_API_KEY: process.env.EXPO_PUBLIC_APP_WRITE_API_KEY,
      APP_WRITE_STORAGE_ID: process.env.EXPO_PUBLIC_APP_WRITE_STORAGE_ID,
      APP_WRITE_PROJECT_ID: process.env.EXPO_PUBLIC_APP_WRITE_PROJECT_ID,
      DATABASE_ID: process.env.EXPO_PUBLIC_DATABASE_ID,
      COLLECTION_DEVICE: process.env.EXPO_PUBLIC_COLLECTION_DEVICE,
      COLLECTION_USER: process.env.EXPO_PUBLIC_COLLECTION_USER,
      COLLECTION_CONTACTS: process.env.EXPO_PUBLIC_COLLECTION_CONTACTS,
      COLLECTION_EVENTS: process.env.EXPO_PUBLIC_COLLECTION_EVENTS,
      COLLECTION_DISTRICT: process.env.EXPO_PUBLIC_COLLECTION_DISTRICT,
      COLLECTION_OPERATORS: process.env.EXPO_PUBLIC_COLLECTION_OPERATORS,
      GMAIL_USER: process.env.EXPO_PUBLIC_GMAIL_USER,
      GMAIL_APP_PASSWORD: process.env.EXPO_PUBLIC_GMAIL_APP_PASSWORD,
      MAPTILER_API_KEY: process.env.EXPO_PUBLIC_MAPTILER_API_KEY,
      GEOCODE_API_KEY: process.env.EXPO_PUBLIC_GEOCODE_API_KEY,
    }
  }
};
