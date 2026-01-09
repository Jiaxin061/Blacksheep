# Assets Directory

This directory is for app assets like icons and splash screens.

## Optional Assets (for production)

You can add these assets later if needed:

- `icon.png` - App icon (1024x1024px recommended)
- `splash.png` - Splash screen image
- `adaptive-icon.png` - Android adaptive icon
- `favicon.png` - Web favicon

## Current Status

The app is configured to run **without** these assets. You can add them later for a more polished look.

## Adding Assets Later

1. Add your image files to this directory
2. Update `app.config.js` to reference them:
   ```javascript
   icon: "./assets/icon.png",
   splash: {
     image: "./assets/splash.png",
     ...
   }
   ```

For now, the app will use default Expo icons and a solid color splash screen.

