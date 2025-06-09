const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Soberi.ai Mobile App...\n');

// Check if node_modules exists
if (!fs.existsSync('node_modules')) {
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
}

// Install Capacitor plugins if not already installed
console.log('📱 Installing Capacitor plugins...');
try {
  execSync('npm install @capacitor/app @capacitor/splash-screen @capacitor/status-bar', { stdio: 'inherit' });
} catch (error) {
  console.log('⚠️  Some plugins may already be installed, continuing...');
}

// Build the app
console.log('\n🔨 Building the app...');
execSync('npm run build', { stdio: 'inherit' });

// Add Android platform
console.log('\n🤖 Adding Android platform...');
try {
  execSync('npx cap add android', { stdio: 'inherit' });
} catch (error) {
  console.log('⚠️  Android platform may already exist, continuing...');
}

// Sync with Capacitor
console.log('\n🔄 Syncing with Capacitor...');
execSync('npx cap sync', { stdio: 'inherit' });

console.log('\n✅ Mobile setup complete!');
console.log('\n📱 Next steps:');
console.log('1. To run on Android: npx cap open android');
console.log('2. In Android Studio, click the "Run" button');
console.log('3. For iOS (Mac only): npx cap add ios && npx cap open ios');
console.log('\n💡 Tips:');
console.log('- Make sure you have Android Studio installed');
console.log('- Enable Developer Mode on your Android device');
console.log('- Connect your device via USB for testing'); 