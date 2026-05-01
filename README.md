# FocusForge

FocusForge is a minimal desktop app for planning and running deep work sessions. The first version focuses on a polished Pomodoro-style timer with custom durations, break cycles, local settings, and dark mode.

## Tech Stack

- Tauri
- React
- TypeScript
- Tailwind CSS
- Recharts, planned for dashboard analytics

## Current Features

- Focus, short break, and long break modes
- Start, pause, reset, and skip controls
- Custom focus and break durations
- Configurable cycles before long break
- Local settings persistence
- Session tags and completed-session history
- History filters by date and tag
- Dashboard with today stats, completion rate, weekly trend, and time by tag
- Light, dark, and system theme modes

## Development

Install dependencies:

```bash
npm install
```

Run the frontend:

```bash
npm run dev
```

Run the desktop app:

```bash
npm run tauri:dev
```

Build the frontend:

```bash
npm run build
```

Build the desktop app:

```bash
npm run tauri:build
```

## Roadmap

- Add native desktop notifications
- Add release packaging assets
