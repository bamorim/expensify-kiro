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

- [ ] 2. Implement organization context switching with UI
  - Add activeOrganizationId field to User model and run migration
  - Add switchContext procedure to update user's active organization
  - Update NextAuth session callback to include organization context
  - Create middleware to validate organization access and write tests
  - Build organization switcher UI component and integrate into layout
  - _Requirements: 1.4, 1.5_

- [ ] 3. Implement organization member management with UI
  - Add listMembers and removeMember procedures to organization router
  - Create admin-only middleware for member management operations
  - Write tests for member listing and removal functionality
  - Build member management UI with list view and remove actions for admins
  - _Requirements: 2.2, 2.3_

- [ ] 4. Create invitation management system with UI
- [ ] 4.1 Add invitation schema, router, and user invitation UI
  - Add OrganizationInvitation model to Prisma schema and run migration
  - Create invitationRouter with create, listForUser, listByOrganization procedures
  - Add input validation for invitation creation and write unit tests
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
  - Create categoryRouter with listByOrganization, create procedures
  - Add input validation for category creation and write unit tests
  - Build category management UI with creation form and listing for admins
  - _Requirements: 4.1, 4.2_

- [ ] 5.2 Implement policy management with configuration UI
  - Add updatePolicies procedure for category policy configuration
  - Create validation for policy rules (amounts, approval thresholds)
  - Write tests for policy creation and updates
  - Build policy configuration UI with form controls for rules and thresholds
  - _Requirements: 4.2, 4.3_

- [ ] 5.3 Create policy evaluation engine
  - Implement business logic to evaluate expenses against category policies
  - Add functions for auto-approval, rejection, and manual review flagging
  - Write comprehensive tests for policy evaluation scenarios
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 6. Implement expense management system with UI
- [ ] 6.1 Add expense schema, router, and submission UI
  - Add Expense model and ExpenseStatus enum to Prisma schema and run migration
  - Create expenseRouter with create, listByUser procedures
  - Add input validation schemas for expense creation and write unit tests
  - Build expense submission form with category selection and amount input
  - _Requirements: 5.1, 5.2_

- [ ] 6.2 Implement expense submission with policy processing and status UI
  - Integrate policy evaluation engine into expense creation
  - Add automatic status assignment based on policy results
  - Write tests for expense submission with various policy scenarios
  - Build expense listing UI showing status, amounts, and policy results
  - _Requirements: 5.3, 6.1, 6.2, 6.3_

- [ ] 6.3 Implement file upload for receipts with UI
  - Add uploadReceipt procedure with file handling
  - Create secure file storage system with proper naming
  - Write tests for receipt upload and association with expenses
  - Build receipt upload component and display in expense forms and details
  - _Requirements: 5.2_

- [ ] 6.4 Create expense review and approval system with admin UI
  - Add listForReview procedure for admin expense queue
  - Implement approve and reject procedures with reason tracking
  - Write tests for expense approval workflow
  - Build admin review queue UI with approve/reject actions and filtering
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 7. Implement reporting and analytics with dashboard UI
- [ ] 7.1 Create reporting tRPC router and analytics dashboard
  - Add procedures for expense summaries by category, user, and time period
  - Implement policy compliance metrics calculation
  - Write unit tests for reporting data aggregation
  - Build analytics dashboard with expense trends and policy effectiveness metrics
  - _Requirements: 10.1, 10.2, 10.3_

- [ ] 7.2 Add export functionality and advanced reporting UI
  - Add export procedures for reports in CSV and PDF formats
  - Create advanced filtering and date range selection
  - Write tests for export functionality
  - Build report export UI with format selection and download capabilities
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
  - Implement adminProcedure middleware for tRPC
  - Add organization membership validation
  - Write comprehensive tests for access control
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
  - Validate multi-organization functionality and data isolation
  - Ensure proper security and access control throughout the application
  - Add final UI polish, responsive design, and accessibility improvements
  - Conduct end-to-end testing of all user workflows
  - _Requirements: All requirements_