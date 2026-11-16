# Patchwork - Design Document

## Architecture

```
index.html
├── Header (Logo, Title)
├── Tab Navigation (Notes | Pomodoro | Kanban | Flashcards)
└── Main Content Area
    ├── Notes Tab Panel
    ├── Pomodoro Tab Panel
    ├── Kanban Tab Panel
    └── Flashcards Tab Panel
```

## File Structure

```
index.html    - Main HTML structure and embedded styles/scripts
styles.css    - Patchwork theme styles (stitched aesthetic)
app.js        - All JavaScript logic for tabs and tools
```

## Design Patterns

### State Management
- Single `appState` object for tab state
- Individual state objects for each tool
- localStorage sync on every state change

### Event Handling
- Centralized event delegation for tab switching
- Debounced input for Markdown preview
- Drag-and-drop event handlers for Kanban

### UI Components
- Tab navigation with data attributes
- Reusable card/container component for all tools
- Modal component for adding/editing items

## CSS Variables (Patchwork Theme)

```css
:root {
  /* Primary colors - patchwork quilt palette */
  --color-bg: #fff8e7;
  --color-surface: #ffffff;
  --color-primary: #ff6b6b;
  --color-secondary: #4ecdc4;
  --color-accent: #ffe66d;
  --color-text: #2d3436;
  --color-border: #dfe6e9;
  
  /* Patchwork-specific */
  --stitch-color: #555;
  --stitch-spacing: 4px;
  --stitch-size: 2px;
  --corner-radius: 8px;
  --padding: 20px;
  
  /* Font families */
  --font-body: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  --font-heading: 'Georgia', serif;
}
```

## Component Styles

### Tab Navigation
- Horizontal flex layout on desktop
- Stacked on mobile
- Each tab has "stitched" dashed border
- Active tab has different background texture

### Patchwork Container
- Background pattern: alternating colors or subtle checkerboard
- Border: dashed `2px var(--stitch-color)` with `border-radius: var(--corner-radius)`
- Padding: `var(--padding)`
- Margin: `10px` spacing between elements

### Notes Tool
- Split view: 50/50 or stacked on mobile
- Left: textarea with patchwork border
- Right: preview div with same styling
- Auto-resize textarea

### Pomodoro Tool
- Large circular timer display
- Color changes: red for work, green for break
- Button row: Start, Pause, Reset
- Cycle counter below timer

### Kanban Tool
- 3-column flex/grid layout
- Cards with different colors/patterns
- Drag handle on each card
- Add task button with + icon

### Flashcards Tool
- Card flip animation using CSS 3D transforms
- Navigation buttons (Previous, Next, Shuffle)
- Known/Unknown counters with color coding

## State Structures

### localStorage Keys
```javascript
{
  currentTab: 'notes',
  notes: {
    content: '# My Notes\n\nWrite here...',
    timestamp: 1234567890
  },
  pomodoro: {
    workDuration: 25,
    breakDuration: 5,
    currentPhase: 'work',
    timeLeft: 25 * 60,
    cycles: 0,
    isRunning: false
  },
  kanban: {
    columns: {
      'todo': [{id, title, description}],
      'doing': [{id, title, description}],
      'done': [{id, title, description}]
    }
  },
  flashcards: {
    decks: [
      {
        id: 'deck1',
        name: 'My First Deck',
        cards: [
          {id: 'card1', front: 'Question?', back: 'Answer!'}
        ]
      }
    ],
    currentDeckId: 'deck1'
  }
}
```

## Animation & Transitions

### Tab Switch
- Fade out old content, fade in new content
- Duration: 200ms

### Card Flip
- CSS 3D transform
- Duration: 600ms
- Preserves 3D space for child elements

### Drag-and-Drop
- Card follows cursor with opacity: 0.8
- Highlight drop zones on drag enter
- Smooth reordering on drop

### Pomodoro Timer
- Smooth countdown using requestAnimationFrame
- Visual pulse on completion