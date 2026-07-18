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

## Workflow Link

- ViaSocket workflow: https://flow.viasocket.com/projects/73129/proj73129/workflow/scrij2dKoCoM/draft?flowhitid=flhj2dKoCoM-aa25aba7613a4146b7e16e159db3d0e6&stepId=funcBVuwDnyR&slugName=Update_pull_request

## Augmentation Log

- Process history: [augmentation_log.md](augmentation_log.md)

## Running Link

- Local preview: http://10.133.253.105:8080/
- Gemini share link: https://share.gemini.google/mMgwJKK3DEOy

## Project Journey

This project started from a practical problem: engineering teams often receive AI-generated code changes and test results in fragmented formats, making it hard to understand what actually changed and whether the fix is trustworthy. The idea behind CodePulse was to turn those scattered signals into a single visual operating view for code quality, patch confidence, and release readiness.

The build process involved turning a Figma Make export into a working React + Vite interface, then shaping it into a dashboard that tells a narrative instead of just displaying numbers. The main challenge was balancing high-end visual design with a usable engineering workflow story so the app feels like a product, not just a mockup.

## Elevator Pitch

This app turns software quality monitoring into a visual, real-time command center for engineering teams. Instead of reading raw test reports and logs, teams can instantly see coverage regressions, understand the fix path, and track AI-generated patch confidence through a clean, high-signal dashboard.
