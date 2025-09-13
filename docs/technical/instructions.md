# Technical Details

## Project Structure
- **Framework**: T3 Stack with Next.js, TypeScript, Prisma, NextAuth, tRPC and Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Testing**: Vitest for unit and integration tests
- **Package Manager**: pnpm
- **Code Quality**: ESLint + Prettier

## Development Patterns
- **API Layer**: tRPC routers with business logic organized directly in procedures
- **Testing**: Unit tests alongside router files (`*.test.ts`) using transactional testing
- **Type Safety**: Full TypeScript support with Zod for runtime validation

## Code Standards
- **File Naming**: kebab-case for files, PascalCase for components/classes
- **Imports**: Use relative imports for local files, absolute imports for packages
- **Error Handling**: Proper error boundaries and user-friendly error messages
- **Accessibility**: WCAG 2.1 AA compliance for all UI components

## Database Guidelines
- **Schema Changes**: Always create migrations for schema changes
- **Multi-tenancy**: Ensure proper organization-scoped data isolation
- **Performance**: Use appropriate indexes and query optimization
- **Relationships**: Maintain referential integrity with foreign keys

## Security Considerations
- **Authentication**: Magic code email-based authentication
- **Authorization**: Role-based access control (Admin/Member)
- **Data Isolation**: Organization-scoped data access
- **Input Validation**: Zod schemas for all user inputs

## Testing Strategy
- **Unit Tests**: Test individual tRPC procedures and components
- **Integration Tests**: Test procedures end-to-end using `createCaller` with transactional testing
- **Test Coverage**: Aim for high coverage of business logic in procedures
- **Mock Strategy**: Use `vitest-mock-extended` for Prisma mocking when needed
- **Transactional Testing**: Use `@chax-at/transactional-prisma-testing` for database operations
- When testing server code that require the database, remember to call `vi.mock("~/server/db")` to enable transactional testing

## Performance Requirements
- **Page Load**: <2 seconds for all pages
- **Database Queries**: Optimized with proper indexing
- **Bundle Size**: Minimize client-side JavaScript
- **Caching**: Implement appropriate caching strategies

## Documentation Standards
- **Code Comments**: JSDoc for public APIs and complex logic
- **README Updates**: Keep README.md current with setup instructions
- **API Documentation**: Document all endpoints and their schemas
- **Architecture Updates**: Keep technical docs current with implementation

## Git Workflow
- **Branch Naming**: `feature/`, `bugfix/`, `hotfix/` prefixes
- **Commit Messages**: Conventional commits format
- **Pull Requests**: Include tests and documentation updates
- **Code Review**: Ensure all changes follow project standards

## Environment Management
- **Environment Variables**: Use `.env` files for configuration
- **Secrets**: Never commit sensitive data to version control
- **Database**: Use separate databases for development/testing/production
- **Dependencies**: Keep dependencies updated and secure

## Monitoring and Observability
- **Error Tracking**: Implement proper error logging
- **Performance Monitoring**: Track key metrics and user experience
- **Health Checks**: Implement system health endpoints
- **Logging**: Structured logging for debugging and monitoring