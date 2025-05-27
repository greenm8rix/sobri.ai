# MyBoo.ai - Recovery Companion (TWA)

MyBoo.ai is a supportive AI companion designed for addiction recovery and mental wellbeing. The application provides users with a non-judgmental space to chat, track their progress, journal their thoughts, and maintain their recovery journey.

## Features

- **Chat Interface**: Communicate with MyBoo, your supportive AI companion
- **Daily Check-ins**: Track your mood and cravings
- **Task Management**: Structured daily activities to support recovery
- **Journaling**: Record your thoughts and reflections
- **Progress Tracking**: Monitor your recovery streaks and milestones
- **Progressive Web App**: Install on your device for an app-like experience
- **Trusted Web App (TWA)**: Available as a native Android app

## Tech Stack

- React 18 with TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- Zustand for state management
- PWA support for offline functionality
- TWA for Android app distribution

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```

## Building for Production

To build the application for production:

```
npm run build
```

This will generate optimized production files in the `dist` directory.

## TWA Generation

To generate the Android TWA app:

1. Install Bubblewrap:
   ```
   npm install -g @bubblewrap/cli
   ```

2. Initialize the TWA project:
   ```
   bubblewrap init --manifest https://your-deployed-url.com/manifest.json
   ```

3. Build the Android App Bundle:
   ```
   bubblewrap build
   ```

## Deployment

The application is set up for easy deployment to Netlify. Simply connect your repository to Netlify and the application will be automatically built and deployed on commits.

## PWA Asset Generation

To generate PWA assets from the app icon:

```
npm run generate-pwa-assets
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Acknowledgments

- The recovery community for inspiration
- All contributors and supporters of mental health and addiction recovery resources