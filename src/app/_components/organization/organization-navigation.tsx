"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { api } from "~/trpc/react";

interface OrganizationNavigationProps {
  organization: {
    id: string;
    name: string;
    userRole: string;
  };
  organizationId: string;
}

export function OrganizationNavigation({ organization, organizationId }: OrganizationNavigationProps) {
  const pathname = usePathname();
  const { data: userOrganizations } = api.organization.listByUser.useQuery();

  const navigationItems = [
    {
      name: "Dashboard",
      href: `/org/${organizationId}`,
      current: pathname === `/org/${organizationId}`,
    },
    {
      name: "Expenses",
      href: `/org/${organizationId}/expenses`,
      current: pathname.startsWith(`/org/${organizationId}/expenses`),
    },
    {
      name: "Categories",
      href: `/org/${organizationId}/categories`,
      current: pathname.startsWith(`/org/${organizationId}/categories`),
      adminOnly: true,
    },
    {
      name: "Members",
      href: `/org/${organizationId}/members`,
      current: pathname.startsWith(`/org/${organizationId}/members`),
      adminOnly: true,
    },
    {
      name: "Reports",
      href: `/org/${organizationId}/reports`,
      current: pathname.startsWith(`/org/${organizationId}/reports`),
      adminOnly: true,
    },
  ];

  const visibleItems = navigationItems.filter(
    item => !item.adminOnly || organization.userRole === 'ADMIN'
  );

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="text-xl font-bold text-gray-900 hover:text-gray-700"
              >
                Expensify
              </Link>
              <span className="text-gray-400">•</span>
              <div className="relative">
                <select
                  value={organizationId}
                  onChange={(e) => {
                    if (e.target.value !== organizationId) {
                      window.location.href = `/org/${e.target.value}`;
                    }
                  }}
                  className="appearance-none bg-transparent text-lg font-semibold text-gray-900 pr-8 focus:outline-none cursor-pointer"
                >
                  {userOrganizations?.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Role: <span className="font-medium">{organization.userRole}</span>
            </span>
            <Link
              href="/api/auth/signout"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Sign out
            </Link>
          </div>
        </div>

        <div className="flex space-x-8 -mb-px">
          {visibleItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                item.current
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}