import fs from 'fs';
import path from 'path';
import { createCanvas } from 'canvas';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure directories exist
const dirs = ['public/android', 'public/maskable', 'public/shortcuts', 'public/screenshots'];
dirs.forEach(dir => {
  if (!fs.existsSync(path.join(__dirname, dir))) {
    fs.mkdirSync(path.join(__dirname, dir), { recursive: true });
  }
});

function createIcon(width, height, text, filepath) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#4f46e5');
  gradient.addColorStop(1, '#7c3aed');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // White text
  ctx.fillStyle = 'white';
  ctx.font = `bold ${Math.min(width, height) * 0.25}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text || 'S.ai', width / 2, height / 2);
  
  // Save to file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(__dirname, filepath), buffer);
  console.log(`Created: ${filepath}`);
}

// Generate all required icons
// Root icons
createIcon(192, 192, 'S.ai', 'public/icon-192.png');
createIcon(512, 512, 'S.ai', 'public/icon-512.png');
createIcon(180, 180, 'S.ai', 'public/apple-icon-180.png');

// Android icons
createIcon(512, 512, 'S.ai', 'public/android/android-launchericon-512-512.png');
createIcon(192, 192, 'S.ai', 'public/android/android-launchericon-192-192.png');
createIcon(144, 144, 'S.ai', 'public/android/android-launchericon-144-144.png');
createIcon(96, 96, 'S.ai', 'public/android/android-launchericon-96-96.png');
createIcon(72, 72, 'S.ai', 'public/android/android-launchericon-72-72.png');
createIcon(48, 48, 'S.ai', 'public/android/android-launchericon-48-48.png');

// Maskable icon
createIcon(512, 512, 'S.ai', 'public/maskable/maskable-icon-512.png');

// Shortcut icons
createIcon(96, 96, 'Chat', 'public/shortcuts/chat.png');
createIcon(96, 96, 'Check', 'public/shortcuts/checkin.png');
createIcon(96, 96, 'Tasks', 'public/shortcuts/tasks.png');

// Screenshots (mobile size)
createIcon(1080, 1920, 'Chat', 'public/screenshots/chat.png');
createIcon(1080, 1920, 'Check-in', 'public/screenshots/checkin.png');
createIcon(1080, 1920, 'Tasks', 'public/screenshots/tasks.png');

console.log('All placeholder icons generated successfully!'); 