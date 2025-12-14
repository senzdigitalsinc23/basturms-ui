---
description: Repository Information Overview
alwaysApply: true
---

# Basturms UI - Firebase Studio Information

## Summary

Firebase Studio is a Next.js-based web application providing a full-stack UI framework for building modern web applications with integrated AI capabilities through Google Genkit, real-time database support via Firebase, and comprehensive UI components powered by Radix UI and Tailwind CSS.

## Structure

```
src/
├── ai/           - Google Genkit AI integration and configuration
├── app/          - Next.js App Router pages and layouts
├── components/   - Reusable React components (UI, forms, etc.)
├── hooks/        - Custom React hooks for business logic
└── lib/          - Utility functions and libraries

public/          - Static assets and PWA manifest
docs/            - Project documentation and blueprints
scripts/         - Build and utility scripts
```

## Language & Runtime

**Language**: TypeScript 5  
**Runtime**: Node.js (via Next.js 15.3.3)  
**Target**: ES2017  
**React Version**: 18.3.1  
**Package Manager**: npm  
**Build System**: Next.js with Turbopack

## Dependencies

**Main Dependencies**:
- **Framework**: `next@15.3.3`, `react@18.3.1`, `react-dom@18.3.1`
- **UI Components**: `@radix-ui/*` (accordion, alert-dialog, avatar, checkbox, dialog, dropdown, etc.)
- **Styling**: `tailwindcss@3.4.1`, `class-variance-authority@0.7.1`, `clsx@2.1.1`, `tailwind-merge@3.0.1`, `tailwindcss-animate@1.0.7`
- **Forms**: `react-hook-form@7.54.2`, `@hookform/resolvers@4.1.3`, `zod@3.24.2`
- **AI**: `@genkit-ai/google-genai@1.20.0`, `@genkit-ai/next@1.20.0`
- **Database**: `firebase@11.9.1`
- **Data Visualization**: `recharts@2.15.1`, `@tanstack/react-table@8.19.3`
- **PDF/Excel**: `jspdf@2.5.1`, `jspdf-autotable@3.8.2`, `xlsx@0.18.5`, `html2canvas@1.4.1`
- **Utilities**: `date-fns@3.6.0`, `framer-motion@11.5.7`, `embla-carousel-react@8.6.0`, `lucide-react@0.475.0`, `cmdk@1.0.0`, `papaparse@5.4.1`
- **PWA**: `@ducanh2912/next-pwa@10.2.7`
- **Environment**: `dotenv@16.5.0`, `patch-package@8.0.0`

**Development Dependencies**:
- `@types/node@20`, `@types/react@18`, `@types/react-dom@18`
- `@types/html2canvas@1.0.0`, `@types/jspdf@2.0.0`, `@types/papaparse@5.3.14`, `@types/xlsx@0.0.35`
- `genkit-cli@1.20.0`
- `postcss@8`, `typescript@5`

## Build & Installation

**Install Dependencies**:
```bash
npm install
```

**Development Server**:
```bash
npm run dev
```
Runs on `http://localhost:9002` with Turbopack hot reload.

**AI Development**:
```bash
npm run genkit:dev
npm run genkit:watch
```

**Build for Production**:
```bash
npm run build
npm run start
```

**Linting & Type Checking**:
```bash
npm run lint
npm run typecheck
```

## Main Files & Resources

**Entry Points**:
- `src/app/page.tsx` - Main application home page
- `src/app/layout.tsx` - Root layout wrapper (inferred from Next.js structure)
- `src/ai/dev.ts` - AI/Genkit development server entry point

**Configuration**:
- `next.config.ts` - Next.js configuration with PWA support, image optimization, and API rewriting
- `tsconfig.json` - TypeScript compiler options targeting ES2017
- `tailwind.config.ts` - Tailwind CSS theme configuration with custom colors, fonts, and animations
- `postcss.config.mjs` - PostCSS configuration
- `components.json` - Component library configuration (likely shadcn/ui)
- `.env.example` or environment variables handled via `NEXT_PUBLIC_API_BASE_URI` for API proxying

**Key Features**:
- API rewrites from `/api/*` to configurable backend (default: `http://127.0.0.1:8000/api/v1`)
- Image optimization for external domains (placehold.co, unsplash.com, picsum.photos)
- PWA support with service workers
- Dark mode via CSS class strategy
- Firebase integration for authentication and real-time database

## Project Configuration Notes

- TypeScript strict mode enabled
- ESLint and type-check errors ignored during builds (configured for development flexibility)
- Supports PWA with service worker registration in production
- API proxy for backend communication
- Custom path aliases: `@/*` maps to `./src/*`
