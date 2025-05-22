## Get started

1. Install dependencies

   ```bash
   npm install
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
   eas build -p android --profile preview
   ```