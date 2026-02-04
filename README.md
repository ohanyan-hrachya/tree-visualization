# Tree Visualization

An interactive tree editor with draggable blocks, collapsible nodes, and SVG connector lines. Built with React, TypeScript, Zustand, and Tailwind CSS.

**Features**

- Infinite depth tree with add/remove nodes
- Node renaming and inline block editing
- Collapsible branches with visual stack state
- Drag and drop blocks across nodes, including reorder
- Orthogonal SVG connectors with rounded corners
- Lazy-loaded editor with React Suspense

**Tech Stack**

- React 19 + TypeScript
- Zustand for state management and persistence
- Tailwind CSS for styling
- Vite for dev/build tooling

**Getting Started**

1. Install dependencies: `pnpm install`
2. Start dev server: `pnpm dev`
3. Build for production: `pnpm build`
4. Preview build: `pnpm preview`

**Scripts**

- `pnpm dev` - run the dev server
- `pnpm build` - production build
- `pnpm preview` - preview the build
- `pnpm lint` - lint the codebase
- `pnpm format` - format the codebase
- `pnpm typecheck` - TypeScript type check

**Project Structure**

- `src/app` - application entry
- `src/features/tree-editor` - tree editor UI and layout
- `src/entities/tree` - tree domain model and store
- `src/shared` - shared UI and utilities
