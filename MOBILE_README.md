# soberi.ai Mobile App Guide

## 🚀 Quick Start

Run the automated setup:
```bash
node setup-mobile.cjs
```

Or manually:
```bash
npm install @capacitor/app @capacitor/splash-screen @capacitor/status-bar
npm run build
npx cap add android
npx cap sync
npx cap open android
```

## 📱 Architecture

```
Web App (React + Vite)
       ↓
   Capacitor
    ↙     ↘
Android    iOS
```

### What Stays the Same:
- ✅ All React components
- ✅ IndexedDB storage
- ✅ Supabase authentication
- ✅ API calls to backend
- ✅ Encryption
- ✅ PWA features

### What's Different:
- 📱 Native app container
- 🎨 Platform-specific UI adjustments
- 🔔 Push notifications (optional)
- 📍 Native features access

## 🛠️ Development Workflow

### 1. Make changes to React app
```bash
npm run dev  # Test in browser first
```

### 2. Build and sync to mobile
```bash
npm run build
npx cap sync
```

### 3. Test on device
```bash
npx cap run android  # With device connected
# OR
npx cap open android  # Opens Android Studio
```

## 📝 Important Files

- `capacitor.config.ts` - Mobile app configuration
- `android/` - Android-specific files (auto-generated)
- `ios/` - iOS-specific files (auto-generated)

## 🎯 Mobile-Specific Features

### Safe Areas
The app automatically handles:
- Status bar padding
- Notch/cutout areas
- Navigation bar padding

### Offline Support
- IndexedDB works perfectly offline
- PWA service worker provides caching
- Backend sync when online

### App Store Preparation

#### Android
1. Generate signed APK in Android Studio
2. Create app listing on Google Play Console ($25 one-time)
3. Upload APK and fill details

#### iOS
1. Requires Mac with Xcode
2. Apple Developer account ($99/year)
3. Generate provisioning profiles
4. Submit through App Store Connect

## 🐛 Troubleshooting

### Build fails
```bash
# Clean and rebuild
rm -rf node_modules dist
npm install
npm run build
npx cap sync
```

### Android Studio issues
- Update Android Studio to latest
- Install Android SDK 33+
- Accept all SDK licenses

### Device not recognized
- Enable Developer Mode
- Enable USB Debugging
- Trust computer on device

## 🔧 Customization

### App Icon
Replace these files:
- `android/app/src/main/res/mipmap-*/ic_launcher.png`
- `ios/App/App/Assets.xcassets/AppIcon.appiconset/*`

### Splash Screen
- Configure in `capacitor.config.ts`
- Add images to platform folders

### Status Bar
```typescript
import { StatusBar } from '@capacitor/status-bar';

// Dark status bar
StatusBar.setBackgroundColor({ color: '#1f2937' });
StatusBar.setStyle({ style: 'DARK' });
```

## 🚢 Publishing

### Beta Testing
- Android: Use Internal Testing track
- iOS: Use TestFlight

### Production Release
1. Update version in `package.json`
2. Build release version
3. Test thoroughly
4. Submit for review

## 📊 Mobile vs Web Comparison

| Feature | Web (PWA) | Mobile App |
|---------|-----------|------------|
| Install | Add to Home | App Store |
| Updates | Instant | Review Required |
| Storage | IndexedDB | IndexedDB + Native |
| Offline | ✅ | ✅ |
| Push Notifications | Limited | Full |
| App Store Presence | ❌ | ✅ |

## 🆘 Help

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Android Studio](https://developer.android.com/studio)
- [Xcode](https://developer.apple.com/xcode/) 