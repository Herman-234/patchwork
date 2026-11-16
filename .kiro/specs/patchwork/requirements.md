# Patchwork - Requirements

## Overview
Patchwork is a single-page web application that combines four productivity tools into one unified interface: Markdown notes with live preview, Pomodoro timer, Kanban board, and flashcards. All tools share a playful "stitched-patchwork" theme and persist their state to localStorage.

## Functional Requirements

### 1. Tab Navigation
- Four tabs: Notes, Pomodoro, Kanban, Flashcards
- Active tab highlighted visually
- Tab state persists across page reloads

### 2. Markdown Notes Tool
- Text area for writing Markdown
- Live preview panel showing rendered HTML
- Basic Markdown support: headings, bold, italic, lists, links, code blocks
- Auto-save to localStorage on input
- Clear save timestamp
- Optional: Toggle between editor-only and preview-only modes

### 3. Pomodoro Timer Tool
- Default timer: 25 minutes work, 5 minutes break
- Start/Pause/Reset buttons
- Countdown display in MM:SS format
- Visual indicator for work vs. break phases
- Cycle counter (number of completed Pomodoros)
- Sound notification on timer completion
- Optional: Settings to adjust timer durations

### 4. Kanban Board Tool
- Three columns: To do, Doing, Done
- Add new tasks with title and optional description
- Edit existing tasks
- Delete tasks
- Drag-and-drop to move tasks between columns
- Drag task between columns to change status
- Save board state to localStorage
- Responsive grid layout that stacks on mobile

### 5. Flashcards Tool
- Deck management: create, select, delete decks
- Card management within decks: add, edit, delete cards
- Each card has front (question/prompt) and back (answer)
- Flip animation: click to reveal answer
- Shuffle cards on load
- Known/Unknown tracking with counter
- Review mode with navigation (Previous/Next buttons)
- Save decks and progress to localStorage

## Non-Functional Requirements

### Performance
- Fast initial load (< 2 seconds)
- Smooth animations for all interactive elements
- No lag during typing or dragging

### Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design for mobile, tablet, and desktop

### Accessibility
- Keyboard navigation for all interactive elements
- Semantic HTML for screen readers
- Sufficient color contrast

### Maintainability
- Clean, organized JavaScript code
- CSS with clear variable definitions
- Self-contained single HTML file

## User Experience

### Visual Design
- Playful "stitched-patchwork" aesthetic
- Mixed colors, patterns, and textures reminiscent of quilt patches
- Visible "stitching" borders (dashed/dotted) around elements
- Rounded corners for soft appearance
- Consistent spacing and typography

### Feedback
- Visual feedback on hover, click, and drag operations
- Success/error messages for user actions
- Loading states where appropriate

### Persistence
- All user data saved automatically
- State restored on page load
- No manual save button required