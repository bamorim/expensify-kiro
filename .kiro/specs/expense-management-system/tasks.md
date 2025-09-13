# Implementation Plan

- [ ] 1. Set up basic organization schema, router, and UI
- [x] 1.1 Create organization data models and router
  - Add Organization and OrganizationMember models to Prisma schema
  - Add OrganizationRole enum to support admin/member roles
  - Create organizationRouter with create, listByUser procedures
  - Add input validation schemas using Zod and write unit tests
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 1.2 Build organization UI and clean up placeholder code
  - Build organization creation form and organization list UI components
  - Remove placeholder Post model, router, and related UI components
  - Update tRPC root router to remove postRouter and add organizationRouter
  - Clean up any Post-related test files and components
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Implement request-based organization scoping with URL routing
  - Create organizationInputSchema and organizationProcedure middleware for tRPC
  - Update organization router to use organizationProcedure for scoped operations
  - Implement URL-based organization routing with Next.js dynamic routes
  - Create organization context validation that checks membership per request
  - Build organization navigation UI that works with URL-based routing
  - Write tests for organization scoping and multi-tab functionality
  - _Requirements: 1.5, 1.6, 1.7_

- [ ] 3. Implement organization member management with UI
  - Add listMembers and removeMember procedures using organizationProcedure
  - Create adminProcedure middleware that extends organizationProcedure for admin-only operations
  - Update procedures to use organizationInputSchema with proper Zod validation
  - Write tests for member listing and removal with organization scoping
  - Build member management UI that works with URL-based organization context
  - _Requirements: 2.2, 2.3_

- [ ] 4. Create invitation management system with UI
- [ ] 4.1 Add invitation schema, router, and user invitation UI
  - Add OrganizationInvitation model to Prisma schema and run migration
  - Create invitationRouter with create, listForUser, listByOrganization procedures using organizationProcedure
  - Add input validation using organizationInputSchema extended with invitation fields
  - Write unit tests for invitation operations with proper organization scoping
  - Build user invitation dashboard showing pending invitations with accept/decline actions
  - _Requirements: 8.1, 8.2, 8.3_

- [ ] 4.2 Implement invitation acceptance workflow and admin UI
  - Add accept and decline procedures for user actions
  - Create logic to convert invitations to organization memberships
  - Write tests for invitation acceptance and organization joining
  - Build admin invitation management UI with create, cancel, and resend functionality
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 5. Create expense category and policy system with UI
- [ ] 5.1 Add category schema, router, and management UI
  - Add ExpenseCategory and CategoryPolicy models to Prisma schema and run migration
  - Create categoryRouter using organizationProcedure and adminProcedure for scoped operations
  - Add input validation using organizationInputSchema extended with category fields
  - Write unit tests for category operations with organization scoping validation
  - Build category management UI that works with URL-based organization context
  - _Requirements: 4.1, 4.2_

- [ ] 5.2 Implement policy management with configuration UI
  - Add updatePolicies procedure using adminProcedure with organizationInputSchema
  - Create validation for policy rules using Zod schemas for amounts and thresholds
  - Write tests for policy creation and updates with organization scoping
  - Build policy configuration UI that works with URL-based organization routing
  - _Requirements: 4.2, 4.3_

- [ ] 5.3 Create policy evaluation engine
  - Implement business logic to evaluate expenses against category policies
  - Add functions for auto-approval, rejection, and manual review flagging
  - Write comprehensive tests for policy evaluation scenarios
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 6. Implement expense management system with UI
- [ ] 6.1 Add expense schema, router, and submission UI
  - Add Expense model and ExpenseStatus enum to Prisma schema and run migration
  - Create expenseRouter using organizationProcedure for all expense operations
  - Add input validation using organizationInputSchema extended with expense fields
  - Write unit tests for expense operations with organization scoping validation
  - Build expense submission form that works with URL-based organization context
  - _Requirements: 5.1, 5.2_

- [ ] 6.2 Implement expense submission with policy processing and status UI
  - Integrate policy evaluation engine into expense creation
  - Add automatic status assignment based on policy results
  - Write tests for expense submission with various policy scenarios
  - Build expense listing UI showing status, amounts, and policy results
  - _Requirements: 5.3, 6.1, 6.2, 6.3_

- [ ] 6.3 Implement file upload for receipts with UI
  - Add uploadReceipt procedure using organizationProcedure with file handling
  - Create secure file storage system with organization-scoped file naming
  - Write tests for receipt upload with organization validation and expense association
  - Build receipt upload component that works with URL-based organization context
  - _Requirements: 5.2_

- [ ] 6.4 Create expense review and approval system with admin UI
  - Add listForReview, approve, and reject procedures using adminProcedure
  - Implement approval workflow with organizationInputSchema validation
  - Write tests for expense approval workflow with organization scoping
  - Build admin review queue UI that works with URL-based organization routing
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 7. Implement reporting and analytics with dashboard UI
- [ ] 7.1 Create reporting tRPC router and analytics dashboard
  - Add reporting procedures using organizationProcedure for organization-scoped data
  - Implement policy compliance metrics calculation with organization filtering
  - Write unit tests for reporting data aggregation with organization scoping
  - Build analytics dashboard that works with URL-based organization context
  - _Requirements: 10.1, 10.2, 10.3_

- [ ] 7.2 Add export functionality and advanced reporting UI
  - Add export procedures using organizationProcedure for organization-scoped exports
  - Create advanced filtering with organizationInputSchema validation
  - Write tests for export functionality with organization scoping
  - Build report export UI that works with URL-based organization routing
  - _Requirements: 10.4_

- [ ] 8. Add notification and status tracking with UI
- [ ] 8.1 Implement expense status tracking with history UI
  - Add status change logging to expense operations
  - Create status history tracking in database
  - Write tests for status transition validation
  - Build expense detail UI showing status history and timeline
  - _Requirements: 9.1, 9.3_

- [ ] 8.2 Create notification system with preferences UI
  - Implement in-app notification for expense status changes
  - Add notification preferences and management
  - Write tests for notification delivery
  - Build notification center UI and user preference settings
  - _Requirements: 9.2, 9.4_

- [ ] 9. Create authentication and onboarding flow with UI
- [ ] 9.1 Implement user registration and first-time setup UI
  - Create user registration flow with email verification
  - Build organization creation wizard for new users
  - Add invitation checking on user login
  - Build onboarding UI with welcome screens and setup guidance
  - _Requirements: 1.1, 1.4_

- [ ] 9.2 Create role-based access control middleware
  - Implement organizationProcedure and adminProcedure middleware for tRPC
  - Add per-request organization membership validation using Zod schemas
  - Write comprehensive tests for access control with organization scoping
  - Test multi-tab functionality to ensure proper organization isolation
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 10. Add comprehensive testing and error handling with UI polish
- [ ] 10.1 Set up testing infrastructure and error handling
  - Configure Vitest with database and auth mocking
  - Create test utilities for common setup patterns
  - Add custom error types for business logic violations
  - Add error boundaries and user-friendly error messages to UI
  - _Requirements: All requirements_

- [ ] 10.2 Add integration tests and performance optimizations
  - Add integration test suite for critical user flows
  - Test complete user journey from registration to expense approval
  - Optimize database queries with proper indexing
  - Add loading states and caching strategies to UI
  - _Requirements: All requirements_

- [ ] 11. Final integration and polish
  - Validate multi-organization functionality with URL-based routing and data isolation
  - Test multi-tab functionality to ensure users can view different organizations simultaneously
  - Ensure proper security and access control with request-based organization validation
  - Add final UI polish, responsive design, and accessibility improvements
  - Conduct end-to-end testing of all user workflows including multi-tab scenarios
  - _Requirements: All requirements_