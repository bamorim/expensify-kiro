import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock tRPC
vi.mock('~/trpc/react', () => ({
  api: {
    organization: {
      listMembers: {
        useQuery: vi.fn(),
      },
      getById: {
        useQuery: vi.fn(),
      },
      removeMember: {
        useMutation: vi.fn(),
      },
    },
  },
}));

// Mock window.confirm
Object.defineProperty(window, 'confirm', {
  value: vi.fn(),
  writable: true,
});

import { MembersList } from './members-list';
import { api } from '~/trpc/react';

describe('MembersList', () => {
  const mockMembers = [
    {
      id: 'member1',
      role: 'ADMIN' as const,
      joinedAt: new Date('2024-01-01'),
      user: {
        id: 'user1',
        name: 'John Admin',
        email: 'john@example.com',
      },
    },
    {
      id: 'member2',
      role: 'MEMBER' as const,
      joinedAt: new Date('2024-01-02'),
      user: {
        id: 'user2',
        name: 'Jane Member',
        email: 'jane@example.com',
      },
    },
  ];

  const mockOrganization = {
    id: 'org1',
    name: 'Test Organization',
    userRole: 'ADMIN' as const,
  };

  const mockRefetch = vi.fn();
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful queries
    vi.mocked(api.organization.listMembers.useQuery).mockReturnValue({
      data: mockMembers,
      isLoading: false,
      refetch: mockRefetch,
    } as unknown as ReturnType<typeof api.organization.listMembers.useQuery>);

    vi.mocked(api.organization.getById.useQuery).mockReturnValue({
      data: mockOrganization,
      isLoading: false,
    } as unknown as ReturnType<typeof api.organization.getById.useQuery>);

    vi.mocked(api.organization.removeMember.useMutation).mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
    } as unknown as ReturnType<typeof api.organization.removeMember.useMutation>);
  });

  it('should render members list correctly', () => {
    render(<MembersList organizationId="org1" />);

    expect(screen.getByText('Organization Members (2)')).toBeInTheDocument();
    expect(screen.getByText('John Admin')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Jane Member')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('should show role badges correctly', () => {
    render(<MembersList organizationId="org1" />);

    const adminBadges = screen.getAllByText('ADMIN');
    const memberBadges = screen.getAllByText('MEMBER');
    
    expect(adminBadges).toHaveLength(1);
    expect(memberBadges).toHaveLength(1);
  });

  it('should show remove button only for non-admin members when user is admin', () => {
    render(<MembersList organizationId="org1" />);

    const removeButtons = screen.getAllByText('Remove');
    expect(removeButtons).toHaveLength(1); // Only one remove button for the MEMBER
  });

  it('should not show remove buttons when user is not admin', () => {
    vi.mocked(api.organization.getById.useQuery).mockReturnValue({
      data: { ...mockOrganization, userRole: 'MEMBER' },
      isLoading: false,
    } as unknown as ReturnType<typeof api.organization.getById.useQuery>);

    render(<MembersList organizationId="org1" />);

    expect(screen.queryByText('Remove')).not.toBeInTheDocument();
  });

  it('should handle member removal with confirmation', async () => {
    vi.mocked(window.confirm).mockReturnValue(true);

    render(<MembersList organizationId="org1" />);

    const removeButton = screen.getByText('Remove');
    fireEvent.click(removeButton);

    expect(window.confirm).toHaveBeenCalledWith(
      'Are you sure you want to remove this member from the organization?'
    );
    expect(mockMutate).toHaveBeenCalledWith({
      organizationId: 'org1',
      userId: 'user2',
    });
  });

  it('should not remove member when confirmation is cancelled', () => {
    vi.mocked(window.confirm).mockReturnValue(false);

    render(<MembersList organizationId="org1" />);

    const removeButton = screen.getByText('Remove');
    fireEvent.click(removeButton);

    expect(window.confirm).toHaveBeenCalled();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('should show loading state', () => {
    vi.mocked(api.organization.listMembers.useQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      refetch: mockRefetch,
    } as unknown as ReturnType<typeof api.organization.listMembers.useQuery>);

    render(<MembersList organizationId="org1" />);

    // Should show loading skeletons
    const loadingElements = screen.getAllByRole('generic');
    expect(loadingElements.some(el => el.className.includes('animate-pulse'))).toBe(true);
  });

  it('should show empty state when no members', () => {
    vi.mocked(api.organization.listMembers.useQuery).mockReturnValue({
      data: [],
      isLoading: false,
      refetch: mockRefetch,
    } as unknown as ReturnType<typeof api.organization.listMembers.useQuery>);

    render(<MembersList organizationId="org1" />);

    expect(screen.getByText('No Members')).toBeInTheDocument();
    expect(screen.getByText("This organization doesn't have any members yet.")).toBeInTheDocument();
  });
});