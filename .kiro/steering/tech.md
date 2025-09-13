# Tech Stack & Development

## Core Technologies

**T3 Stack** - Type-safe full-stack solution with minimal configuration
- **Next.js 15** with App Router - React framework with server components
- **TypeScript** - Full type safety from database to UI
- **Prisma** - Type-safe database ORM with PostgreSQL
- **tRPC** - End-to-end type-safe APIs with TanStack Query
- **NextAuth 5.0** - Authentication with session management
- **Tailwind CSS** - Utility-first styling
- **Vitest** - Testing framework with React Testing Library

## Package Management

- **pnpm** - Fast, efficient package manager
- **Node.js ecosystem** - Staying within familiar tooling

## Development Commands

```bash
# Development
pnpm dev              # Start dev server with Turbo
pnpm build            # Production build
pnpm start            # Start production server
pnpm preview          # Build and start locally

# Database
pnpm db:generate      # Generate Prisma client & run migrations
pnpm db:push          # Push schema changes (dev)
pnpm db:studio        # Open Prisma Studio on :5555
pnpm db:push:test     # Push to test database
pnpm db:studio:test   # Test DB studio on :5556

# Code Quality
pnpm check            # Lint + typecheck
pnpm lint             # ESLint
pnpm lint:fix         # Fix linting issues
pnpm typecheck        # TypeScript check
pnpm format:check     # Prettier check
pnpm format:write     # Format code

# Testing
pnpm test             # Run tests with test DB
pnpm test:reset       # Reset test database
```

## Architecture Patterns

- **Server Components** - Reduce API complexity, render on server
- **tRPC Procedures** - `publicProcedure` and `protectedProcedure`
- **Prisma Schema** - Single source of truth for data models
- **Environment Variables** - Validated with `@t3-oss/env-nextjs`
- **Transactional Testing** - Isolated test database operations

## Code Style

- **ESLint + Prettier** - Automated formatting and linting
- **TypeScript strict mode** - Full type safety enforcement
- **Tailwind classes** - Utility-first CSS approach
- **Server/Client separation** - Clear boundaries with `server-only`

## Global Acceptance Criteria

- Before any tasks are deemed as completed we need to ensure that tests are passing (`pnpm test`), linter is passing (`pnpm lint`) and types are correct (`pnpm typecheck`)