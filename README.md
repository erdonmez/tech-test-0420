# AG Grid React App

A simple spreadsheet-like app built with React and ag-grid. Started as a basic table and evolved into something more interesting.

## Prerequisites

- Node.js 20.9.0+ or 21.1.0+ ([Download here](https://nodejs.org/))
- Yarn

## Getting started

```bash
./dev.sh
```

That's it. The app will open at `localhost`.

## What it does

- **Editable grid**: Click any cell to edit, just like a spreadsheet
- **Persistent data**: Your changes are saved to localStorage automatically
- **Real-time sync**: Open multiple tabs and see changes instantly across all of them
- **Background computation**: Uses a Web Worker to handle data processing without blocking the UI
- **Visual feedback**: Cells with negative values flash red for 3 seconds

## How it works

The grid has 4 columns (A, B, C, D) and 10 rows. All cells are editable. When you change a value:

1. Raw data gets saved to localStorage
2. A Web Worker processes the data in the background
3. The grid updates with computed values
4. Other browser tabs get notified via storage events

## Technical stuff

- React 18 with TypeScript
- ag-grid-community for the table
- Web Worker for background processing
- localStorage for persistence
- CSS animations for the flashing effect

## Files

- `src/App.tsx` - Main component with all the logic
- `src/App.css` - Styles for the flash animation

## Why this approach

Originally just needed a working ag-grid table. Then added persistence to keep data. Then added the Worker because heavy computation was blocking the UI. The multi-tab comes with the localStorage setup.

## Tech Stack

- Vite for fast development
- React + TypeScript
- ag-grid-community
- Web Workers for background processing
