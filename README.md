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

**CI/CD (GitHub + Vercel)**

- GitHub Actions `CI` runs typecheck, lint, and build on every pull request and on pushes to `main`.
- GitHub Actions `Vercel Deploy` deploys previews for pull requests and production for pushes to `main`.
- Vercel setup: create a Vercel project and connect this repo.
- Add these GitHub repo secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

**Project Structure**

- `src/app` - application entry
- `src/features/tree-editor` - tree editor UI and layout
- `src/entities/tree` - tree domain model and store
- `src/shared` - shared UI and utilities

<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/e55c1d0f-759c-49c2-8838-dc06215069dd" />


