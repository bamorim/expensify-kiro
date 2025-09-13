"use client";

import Link from "next/link";
import { api } from "~/trpc/react";

export function OrganizationList() {
  const { data: organizations, isLoading, error } = api.organization.listByUser.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="animate-pulse rounded-lg border border-gray-200 p-4">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-red-800">Failed to load organizations: {error.message}</p>
      </div>
    );
  }

  if (!organizations || organizations.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Organizations</h3>
        <p className="text-gray-600">
          You haven&apos;t created or joined any organizations yet. Create your first organization to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Your Organizations</h2>
      
      <div className="space-y-3">
        {organizations.map((org) => (
          <Link
            key={org.id}
            href={`/org/${org.id}`}
            className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors">
                  {org.name}
                </h3>
                {org.description && (
                  <p className="text-gray-600 mt-1">{org.description}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className={`inline-block w-2 h-2 rounded-full ${
                      org.userRole === 'ADMIN' ? 'bg-blue-500' : 'bg-green-500'
                    }`}></span>
                    {org.userRole}
                  </span>
                  <span>{org.memberCount} member{org.memberCount !== 1 ? 's' : ''}</span>
                  <span>Created {new Date(org.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center text-gray-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}