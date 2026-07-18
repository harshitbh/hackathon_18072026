# Figma Make App

A modern React + Vite + Tailwind single-page app designed as a polished engineering operations dashboard for AI-assisted code quality and release workflows.

## Project Overview

This project presents a high-contrast, data-rich interface for visualizing:

- code coverage failures and fixes
- CI / PR workflow signals
- mutation scan results
- live delivery logs and trace IDs
- automated patch generation and safety feedback

It is built as a Figma Make export and is intended to run locally with Vite.

## Tech Stack

- React 19
- Vite 8
- TypeScript
- Tailwind CSS v4

## Features

- Interactive dashboard layout
- Visual status cards and telemetry-inspired UI
- Coverage regression and patch comparison storytelling
- Clean development workflow with hot reloading

## Getting Started

1. Install dependencies

```bash
npm install
```

2. Start the development server

```bash
npm run dev
```

3. Open the local URL shown in the terminal, typically:

```text
http://localhost:8443/
```

If port 8443 is already occupied, run the app with a different port:

```bash
$env:PORT='4174'; npm run dev
```

## Production Build

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## Elevator Pitch

This app turns software quality monitoring into a visual, real-time command center for engineering teams. Instead of reading raw test reports and logs, teams can instantly see coverage regressions, understand the fix path, and track AI-generated patch confidence through a clean, high-signal dashboard.
