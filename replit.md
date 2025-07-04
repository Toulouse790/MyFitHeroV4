# MyFitHero - Replit.md

## Overview

MyFitHero is a comprehensive fitness companion application built with a modern full-stack architecture. It features a React frontend with TypeScript, Express.js backend, and PostgreSQL database with Drizzle ORM. The application focuses on four core wellness pillars: Sport, Nutrition, Sleep, and Hydration, providing personalized fitness tracking and AI-powered recommendations.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **State Management**: Zustand with persistence
- **Routing**: React Router DOM
- **Authentication**: Supabase Auth with session management
- **Data Fetching**: TanStack Query for server state management
- **Styling**: Tailwind CSS with custom fitness-themed gradients and variables

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: PostgreSQL-based sessions
- **API Design**: RESTful endpoints with `/api` prefix

### Database Architecture
- **ORM**: Drizzle ORM with TypeScript schema definitions
- **Database**: PostgreSQL (configured for Neon serverless)
- **Migrations**: Drizzle Kit for schema management
- **Schema Location**: `./shared/schema.ts` (shared between client and server)

## Key Components

### Core Modules
1. **Sport Module**: Personalized workout programs, exercise tracking, and sport-specific training
2. **Nutrition Module**: Meal planning, calorie tracking, and dietary recommendations
3. **Sleep Module**: Sleep quality monitoring and recovery optimization
4. **Hydration Module**: Water intake tracking with sport-specific recommendations

### User Management
- **Authentication**: Supabase-based auth with username/email support
- **User Profiles**: Comprehensive profiles with sport-specific data
- **Onboarding**: Interactive questionnaire for personalized setup
- **Module Activation**: Dynamic module enablement based on user preferences

### AI Integration
- **Recommendations**: AI-powered fitness and nutrition suggestions
- **Smart Dashboard**: Context-aware dashboard with personalized insights
- **Chat Interface**: Voice and text-based AI interaction

### UI Components
- **Design System**: shadcn/ui components with custom fitness theming
- **Responsive Design**: Mobile-first approach with progressive enhancement
- **Dark Mode**: CSS variables-based theme system
- **Navigation**: Bottom navigation for mobile, sidebar for desktop

## Data Flow

### Authentication Flow
1. User signs in through Supabase Auth
2. Session stored in browser and validated on server
3. User profile loaded from database
4. App store populated with user data and preferences

### Module Data Flow
1. User selects active modules during onboarding
2. Module-specific data tracked in respective database tables
3. Daily stats aggregated for dashboard display
4. AI recommendations generated based on user activity

### Real-time Updates
- Supabase real-time subscriptions for live data updates
- Zustand store updates trigger UI re-renders
- Toast notifications for user feedback

## External Dependencies

### Primary Dependencies
- **@supabase/supabase-js**: Authentication and real-time database
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database queries
- **@tanstack/react-query**: Server state management
- **zustand**: Client state management
- **react-router-dom**: Client-side routing

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **class-variance-authority**: Utility for managing CSS classes

### Development Dependencies
- **vite**: Build tool and dev server
- **typescript**: Type checking
- **tsx**: TypeScript execution
- **esbuild**: Fast bundler for production

## Deployment Strategy

### Build Process
1. **Frontend**: Vite builds React app to `dist/public`
2. **Backend**: esbuild bundles Express server to `dist/index.js`
3. **Database**: Drizzle migrations applied via `db:push` command

### Environment Configuration
- **Development**: Uses `NODE_ENV=development` with Vite dev server
- **Production**: Serves static files from Express with `NODE_ENV=production`
- **Database**: Requires `DATABASE_URL` environment variable

### Scripts
- `dev`: Starts development server with hot reload
- `build`: Builds both frontend and backend for production
- `start`: Runs production server
- `check`: TypeScript type checking
- `db:push`: Applies database schema changes

### Replit-Specific Features
- **Cartographer**: Development-time code mapping
- **Runtime Error Overlay**: Enhanced error reporting
- **Development Banner**: Indicates when running outside Replit

## Changelog

```
Changelog:
- July 04, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```

### Architecture Decisions Summary

1. **Monorepo Structure**: Shared types and schema between client/server for type safety
2. **Supabase Integration**: Chosen for auth, real-time features, and managed database
3. **Drizzle ORM**: Type-safe database operations with PostgreSQL
4. **Module System**: Flexible architecture allowing users to enable/disable features
5. **AI Integration**: Structured for future AI capabilities with dedicated database tables
6. **Mobile-First**: Responsive design prioritizing mobile experience
7. **State Management**: Zustand for simplicity and performance over Redux
8. **Build Strategy**: Vite for development speed, esbuild for production optimization

The application is designed to be easily extensible with new fitness modules while maintaining a clean separation of concerns between frontend, backend, and database layers.