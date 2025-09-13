"use client";

import { api } from "~/trpc/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/app/_components/ui/card";

interface OrganizationDashboardProps {
  organizationId: string;
}

export function OrganizationDashboard({ organizationId }: OrganizationDashboardProps) {
  const { data: organization, isLoading: orgLoading } = api.organization.getById.useQuery({
    organizationId,
  });

  const { data: members, isLoading: membersLoading } = api.organization.listMembers.useQuery({
    organizationId,
  });

  if (orgLoading || membersLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-white rounded-lg p-6 shadow">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Organization not found
        </h2>
        <p className="text-gray-600">
          {"The organization you're looking for doesn't exist or you don't have access to it."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{organization.name}</h1>
        {organization.description && (
          <p className="text-gray-600 mt-2">{organization.description}</p>
        )}
        <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
          <span>Your role: <span className="font-medium">{organization.userRole}</span></span>
          <span>•</span>
          <span>{organization.memberCount} member{organization.memberCount !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
            <CardDescription>Organization members and their roles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members?.length ?? 0}</div>
            <div className="text-sm text-gray-600 mt-2">
              {members?.filter(m => m.role === 'ADMIN').length ?? 0} admin{(members?.filter(m => m.role === 'ADMIN').length ?? 0) !== 1 ? 's' : ''}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expenses</CardTitle>
            <CardDescription>Total expenses this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0</div>
            <div className="text-sm text-gray-600 mt-2">0 pending approval</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>Expense categories configured</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <div className="text-sm text-gray-600 mt-2">Set up expense categories</div>
          </CardContent>
        </Card>
      </div>

      {organization.userRole === 'ADMIN' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Admin Actions
          </h3>
          <p className="text-blue-700 mb-4">
            As an admin, you can manage organization settings, members, and expense policies.
          </p>
          <div className="flex gap-3">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
              Manage Members
            </button>
            <button className="bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors">
              Configure Policies
            </button>
          </div>
        </div>
      )}
    </div>
  );
}