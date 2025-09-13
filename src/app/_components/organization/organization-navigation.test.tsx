import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { usePathname } from 'next/navigation';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

// Mock tRPC
vi.mock('~/trpc/react', () => ({
  api: {
    organization: {
      listByUser: {
        useQuery: vi.fn(),
      },
    },
  },
}));

import { OrganizationNavigation } from './organization-navigation';
import { api } from '~/trpc/react';

// Mock window.location for navigation tests
Object.defineProperty(window, 'location', {
  value: {
    href: '',
  },
  writable: true,
});

describe('OrganizationNavigation - Multi-tab Support', () => {
  const mockOrganization = {
    id: 'org123',
    name: 'Test Organization',
    userRole: 'ADMIN',
  };

  const mockUserOrganizations = [
    { id: 'org123', name: 'Test Organization', userRole: 'ADMIN' },
    { id: 'org456', name: 'Another Organization', userRole: 'MEMBER' },
    { id: 'org789', name: 'Third Organization', userRole: 'ADMIN' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock tRPC query
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    vi.mocked(api.organization.listByUser.useQuery).mockReturnValue({
      data: mockUserOrganizations,
      isLoading: false,
      error: null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  });

  it('should render navigation with correct organization context', () => {
    vi.mocked(usePathname).mockReturnValue('/org/org123');

    render(
      <OrganizationNavigation 
        organization={mockOrganization} 
        organizationId="org123" 
      />
    );

    expect(screen.getByText('Test Organization')).toBeInTheDocument();
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
  });

  it('should show admin-only navigation items for admin users', () => {
    vi.mocked(usePathname).mockReturnValue('/org/org123');

    render(
      <OrganizationNavigation 
        organization={mockOrganization} 
        organizationId="org123" 
      />
    );

    // Admin should see all navigation items
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Expenses')).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('Members')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
  });

  it('should hide admin-only navigation items for member users', () => {
    const memberOrganization = {
      ...mockOrganization,
      userRole: 'MEMBER',
    };

    vi.mocked(usePathname).mockReturnValue('/org/org123');

    render(
      <OrganizationNavigation 
        organization={memberOrganization} 
        organizationId="org123" 
      />
    );

    // Member should only see basic navigation items
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Expenses')).toBeInTheDocument();
    
    // Admin-only items should not be visible
    expect(screen.queryByText('Categories')).not.toBeInTheDocument();
    expect(screen.queryByText('Members')).not.toBeInTheDocument();
    expect(screen.queryByText('Reports')).not.toBeInTheDocument();
  });

  it('should highlight current page in navigation', () => {
    vi.mocked(usePathname).mockReturnValue('/org/org123/expenses');

    render(
      <OrganizationNavigation 
        organization={mockOrganization} 
        organizationId="org123" 
      />
    );

    const expensesLink = screen.getByText('Expenses').closest('a');
    const dashboardLink = screen.getByText('Dashboard').closest('a');

    // Expenses should be highlighted (current page)
    expect(expensesLink).toHaveClass('border-blue-500', 'text-blue-600');
    
    // Dashboard should not be highlighted
    expect(dashboardLink).toHaveClass('border-transparent', 'text-gray-500');
  });

  it('should support organization switching for multi-tab functionality', () => {
    vi.mocked(usePathname).mockReturnValue('/org/org123');

    render(
      <OrganizationNavigation 
        organization={mockOrganization} 
        organizationId="org123" 
      />
    );

    const orgSelect = screen.getByDisplayValue('Test Organization');
    expect(orgSelect).toBeInTheDocument();

    // Verify all organizations are available in the dropdown
    expect(screen.getByText('Test Organization')).toBeInTheDocument();
    expect(screen.getByText('Another Organization')).toBeInTheDocument();
    expect(screen.getByText('Third Organization')).toBeInTheDocument();
  });

  it('should navigate to different organization when selected', () => {
    vi.mocked(usePathname).mockReturnValue('/org/org123');

    render(
      <OrganizationNavigation 
        organization={mockOrganization} 
        organizationId="org123" 
      />
    );

    const orgSelect = screen.getByDisplayValue('Test Organization');
    
    // Simulate changing to a different organization
    fireEvent.change(orgSelect, { target: { value: 'org456' } });

    // Should trigger navigation to the new organization
    expect(window.location.href).toBe('/org/org456');
  });

  it('should not navigate when selecting the same organization', () => {
    vi.mocked(usePathname).mockReturnValue('/org/org123');
    window.location.href = ''; // Reset

    render(
      <OrganizationNavigation 
        organization={mockOrganization} 
        organizationId="org123" 
      />
    );

    const orgSelect = screen.getByDisplayValue('Test Organization');
    
    // Simulate selecting the same organization
    fireEvent.change(orgSelect, { target: { value: 'org123' } });

    // Should not trigger navigation
    expect(window.location.href).toBe('');
  });

  it('should render correct navigation links with organization context', () => {
    vi.mocked(usePathname).mockReturnValue('/org/org123');

    render(
      <OrganizationNavigation 
        organization={mockOrganization} 
        organizationId="org123" 
      />
    );

    // Verify all links have correct organization context
    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/org/org123');
    expect(screen.getByText('Expenses').closest('a')).toHaveAttribute('href', '/org/org123/expenses');
    expect(screen.getByText('Categories').closest('a')).toHaveAttribute('href', '/org/org123/categories');
    expect(screen.getByText('Members').closest('a')).toHaveAttribute('href', '/org/org123/members');
    expect(screen.getByText('Reports').closest('a')).toHaveAttribute('href', '/org/org123/reports');
  });

  it('should support different organization contexts simultaneously', () => {
    // This test simulates what would happen in different browser tabs
    
    // First tab context - org123
    const { rerender } = render(
      <OrganizationNavigation 
        organization={mockOrganization} 
        organizationId="org123" 
      />
    );

    vi.mocked(usePathname).mockReturnValue('/org/org123/expenses');
    
    expect(screen.getByText('Test Organization')).toBeInTheDocument();
    expect(screen.getByText('Dashboard').closest('a')).toHaveClass('border-blue-500');

    // Second tab context - org456 (simulated by rerendering with different props)
    const anotherOrganization = {
      id: 'org456',
      name: 'Another Organization',
      userRole: 'MEMBER',
    };

    vi.mocked(usePathname).mockReturnValue('/org/org456');

    rerender(
      <OrganizationNavigation 
        organization={anotherOrganization} 
        organizationId="org456" 
      />
    );

    expect(screen.getByText('Another Organization')).toBeInTheDocument();
    expect(screen.getByText('MEMBER')).toBeInTheDocument();
    
    // Member role should not see admin items
    expect(screen.queryByText('Categories')).not.toBeInTheDocument();
    
    // Dashboard should be highlighted for this context
    expect(screen.getByText('Dashboard').closest('a')).toHaveClass('border-blue-500');
  });
});