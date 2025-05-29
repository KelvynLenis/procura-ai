## Get started

1. Install dependencies

   Dependencias do projeto
   ```bash
   npm install
   ```

   Dependencias da build
   ```bash
      npm install -g eas-cli
      eas login
      npx expo install expo-dev-client
   ```

2. Start the app

   ```bash
   npx expo start
   ```

   if it doesn't work, try running:
  ```bash
   npx expo start --tunnel --clear
   ```

3. Build
   IOS:
   ```bash
   eas build --platform ios --profile development-ios
   ```

   Android:
   ```bash
   eas build -p android --profile deployment
   ```

   ou 

    ```bash
   eas build -p android --profile development
   ```