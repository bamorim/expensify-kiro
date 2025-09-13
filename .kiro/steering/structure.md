# Project Structure & Organization

## Root Level

```
├── src/                    # Application source code
├── prisma/                 # Database schema and migrations
├── docs/                   # Project documentation
├── public/                 # Static assets
├── .kiro/                  # Kiro AI assistant configuration
└── compose.yml             # Docker services (database)
```

## Source Code Organization (`src/`)

```
src/
├── app/                    # Next.js App Router pages and layouts
│   ├── _components/        # Shared React components
│   ├── api/               # API routes (auth, tRPC)
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Home page
├── server/                # Server-side code
│   ├── api/               # tRPC routers and configuration
│   ├── auth/              # NextAuth configuration
│   └── db/                # Database client and mocks
├── trpc/                  # tRPC client configuration
├── styles/                # Global CSS and Tailwind
└── env.js                 # Environment variable validation
```

## Key Conventions

### File Naming
- **React components**: PascalCase (`UserProfile.tsx`)
- **Pages**: lowercase (`page.tsx`, `layout.tsx`)
- **API routes**: lowercase with brackets (`[...nextauth]/route.ts`)
- **Utilities**: camelCase (`query-client.ts`)

### Import Aliases
- `~/` - Points to `src/` directory
- Use absolute imports: `~/server/db` instead of `../../../server/db`

### Component Organization
- **Server Components** - Default in App Router, no "use client"
- **Client Components** - Explicit `"use client"` directive
- **Shared components** - Place in `_components/` folders

### tRPC Structure
- **Routers** - Organized by feature in `src/server/api/routers/`
- **Procedures** - Use `publicProcedure` or `protectedProcedure`
- **Context** - Session and database access via tRPC context

### Database
- **Schema** - Single `prisma/schema.prisma` file
- **Migrations** - Auto-generated in `prisma/migrations/`
- **Client** - Accessed via `~/server/db`

## Documentation Structure (`docs/`)

```
docs/
├── product/               # Product requirements and features
├── technical/             # Architecture and technical decisions
├── tasks/                 # Development tasks and planning
└── templates/             # Document templates (ADR, PRD, etc.)
```

## Environment Files
- `.env.example` - Template with all required variables
- `.env.test` - Test environment configuration
- `.env` - Local development (gitignored)

## Testing
- **Unit tests** - Colocated with source files
- **Test database** - Separate from development
- **Mocks** - Organized in `__mocks__/` directories