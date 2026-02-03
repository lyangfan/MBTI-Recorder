# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MBTI Vibe is a single-page React application for managing friends' MBTI (Myers-Briggs Type Indicator) personality types. It provides a personal organizational tool for:
- Storing and managing friend profiles with MBTI data
- Visualizing MBTI distributions through charts
- Organizing friends into custom groups
- Viewing personality-based tags and characteristics

## Development Commands

```bash
# Navigate to the app directory first
cd mbti-vibe

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

**Important**: All commands must be run from the `mbti-vibe/` directory, not the root repository directory.

## Technology Stack

- **React 19.2.0** - Functional components with hooks (no class components)
- **Vite 7.2.4** - Build tool and dev server with Fast Refresh
- **Tailwind CSS 4.1.18** - Utility-first styling (PostCSS-based)
- **Recharts 3.7.0** - Data visualization for MBTI statistics
- **Lucide React** - Icon library
- **ESLint** - Flat config with React-specific rules

## Architecture

### Component Structure

The application follows a centralized state pattern with all data managed in `App.jsx`:

```
App.jsx (central state & localStorage sync)
├── GroupTabs - Group filtering navigation
├── StatsView - MBTI distribution charts (collapsible)
├── UserCard - Individual friend cards
└── FriendFormModal - Add/edit friend modal
```

**Key architectural patterns**:
- All state is local (no global state management library)
- Data persistence via automatic localStorage synchronization
- No external API calls - purely client-side application
- Modal-based forms with validation
- Mobile-first responsive design

### Data Flow

1. **State Management**: `friends` array in `App.jsx` is the single source of truth
2. **Persistence**: `useEffect` automatically saves to localStorage on any change
3. **Filtering**: `filteredFriends` computed via `useMemo` based on active group
4. **Groups**: Dynamically extracted from friends' `group` property

### MBTI Theming System

The application uses a sophisticated color-coding system based on:
- **MBTI Groups** (4 categories): 分析家 (Analysts), 外交家 (Diplomats), 守护者 (Sentinels), 探险家 (Explorers)
- **Gender**: Male/female/other variations create darker/lighter gradient shades

Color mapping is defined in `UserCard.jsx`:
- Purple for Analysts (INTx, ENTx)
- Green for Diplomats (INFx, ENFx)
- Blue for Sentinels (ISTx, ESTx, ISFx, ESFx)
- Yellow for Explorers (ISTP, ISFP, ESTP, ESFP)

### Data Schema

Friend object structure:
```javascript
{
  id: string,           // Unique identifier
  name: string,         // Display name
  gender: '男'|'女',    // Gender (affects color shading)
  mbti: string,         // 4-letter MBTI type (e.g., 'INTJ')
  age: number,          // Age in years
  nationality: string,  // Country (defaults to '中国')
  province: string,     // Province/state (defaults to '北京')
  group: string,        // Custom group name for filtering
  avatar: string,       // Emoji as avatar
  tags: string[]        // Auto-generated from MBTI type
}
```

### Data Migration

The app includes backward compatibility for old data formats:
- Legacy `hometown` field is automatically migrated to `nationality` and `province`
- Migration happens in `useEffect` on app initialization

## Component Details

### App.jsx
- Central state management with `useState` hooks
- CRUD operations: `handleEdit`, `handleDelete`, `handleSubmit`
- Tag auto-generation based on MBTI type (16 types mapped to descriptive tags)
- Default demo data loads when localStorage is empty

### UserCard.jsx
- Dynamic gradient styling based on MBTI group and gender
- Interactive press animations (scale-95 on click)
- Edit/delete action buttons
- MBTI group classification logic

### FriendFormModal.jsx
- Modal dialog for adding/editing friends
- Form validation
- Submits data back to parent component

### GroupTabs.jsx
- Horizontal scrolling tab navigation
- Dynamically renders groups extracted from friend data
- Always includes "全部" (All) option

### StatsView.jsx
- Collapsible statistics panel
- Uses Recharts for pie chart visualization
- Shows MBTI distribution for current group selection

## Build Configuration

- **Entry Point**: `src/main.jsx` → `src/App.jsx`
- **HTML Template**: `index.html` with root div
- **Module System**: ES modules (`"type": "module"` in package.json)
- **Linting**: ESLint flat config with React Hooks and React Refresh plugins
- **Styling**: PostCSS with Tailwind CSS v4 plugin

## Code Style Notes

- Functional components only (no class components)
- React hooks for state and side effects
- Memoization with `useMemo` for computed values
- Chinese language UI and comments throughout
- Avatar emojis instead of images
- No TypeScript (plain JavaScript with JSX)

## Testing

No testing framework is currently implemented. Consider adding Vitest or Jest if adding tests.
