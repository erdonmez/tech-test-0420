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

## Instructions for Running and Testing

### Running the Project

```bash
./dev.sh
```

This will install dependencies and start the development server.

### Testing the Functionality

**Testing Formulas:**

- Type `=A1+B2` in any cell to see formula calculation
- Try `=A1*2` or `=A1-B2` for other operations
- Formulas update automatically when referenced cells change

**Testing Multi-tab Sync:**

- Open the app in two browser tabs
- Edit a cell in one tab
- See the change appear instantly in the other tab
- Changes persist after page refresh

**Testing Visual Feedback:**

- Enter a negative number (like `-5`) in any cell
- Watch the entire row flash red for 3 seconds
- Works with both direct numbers and formula results

## Important Decisions and Trade-offs

**Web Worker for Formulas:**

- Keeps UI responsive during calculations
- Trade-off: More complex setup vs blocking main thread

**localStorage for Sync:**

- Simple, works across tabs instantly
- Trade-off: Limited to same browser vs full websocket solution
- Edge case: Could conflict if multiple users on same machine

**Row Flashing Implementation:**

- Flashes entire row vs just cell for better visibility
- 3-second duration balances visibility vs distraction
- Uses CSS animations for smooth effect

**Formula Parsing:**

- Simple left-to-right evaluation (no precedence)
- Trade-off: Quick implementation vs full math parser
- Handles basic cases within time constraints

**Time Constraints:**

- Prioritized core requirements over edge cases
- Simple error handling (`#ERR` for invalid formulas)
- Basic UI styling vs polished design system

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

## Tech Stack

- Vite for fast development
- React + TypeScript
- ag-grid-community
- Web Workers for background processing
