# IndexedDB Storage Implementation

## Overview
soberi.ai now uses IndexedDB for local storage instead of localStorage to handle larger amounts of data without crashes.

## Key Benefits
- **Larger Storage Capacity**: Up to 1GB+ instead of 5MB
- **Async Operations**: Non-blocking, won't freeze the UI
- **Automatic Cleanup**: Old messages are automatically removed when approaching limits
- **Crash Prevention**: Graceful handling of storage limits

## What Gets Stored
- Chat conversations (last 300 messages)
- Check-ins
- Journal entries (last 200)
- Progress tracking
- Tasks and goals
- Insights (last 100)
- Memory system data
- Conversation summaries

## Storage Management
### Automatic Cleanup
When storage approaches its limit:
1. Old chat messages beyond the most recent 300 are removed
2. Old insights (that have been shown) are removed
3. Old journal entries beyond the most recent 200 are removed

### Storage Indicator
- Green: < 50% used
- Yellow: 50-80% used  
- Red: > 80% used (automatic cleanup activated)

## Migration from localStorage
The app automatically migrates existing data from localStorage to IndexedDB on first load. This is a one-time process.

## Error Handling
If storage quota is exceeded:
1. The app attempts automatic cleanup
2. If cleanup fails, users see an error message
3. Data is preserved as much as possible

## Browser Support
- Chrome: ✅ (50MB-2GB)
- Firefox: ✅ (50MB-2GB)
- Safari: ✅ (50MB-1GB)
- Edge: ✅ (50MB-2GB)

## For Developers
The implementation uses:
- `idb` library for Promise-based IndexedDB access
- Encryption for all stored data
- Automatic migration from localStorage
- Type-safe TypeScript interfaces 