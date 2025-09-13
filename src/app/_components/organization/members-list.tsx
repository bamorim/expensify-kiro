"use client";

import { api } from "~/trpc/react";

interface MembersListProps {
  organizationId: string;
}

export function MembersList({ organizationId }: MembersListProps) {
  const { data: members, isLoading } = api.organization.listMembers.useQuery({
    organizationId,
  });

  const { data: organization } = api.organization.getById.useQuery({
    organizationId,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="animate-pulse bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!members || members.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Members</h3>
        <p className="text-gray-600">
          {"This organization doesn't have any members yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Organization Members ({members.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {members.map((member) => (
            <div key={member.id} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {member.user.name?.charAt(0)?.toUpperCase() ?? member.user.email?.charAt(0)?.toUpperCase() ?? '?'}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {member.user.name ?? 'Unknown User'}
                  </div>
                  <div className="text-sm text-gray-500">{member.user.email}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  member.role === 'ADMIN' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {member.role}
                </span>
                
                <div className="text-sm text-gray-500">
                  Joined {new Date(member.joinedAt).toLocaleDateString()}
                </div>
                
                {organization?.userRole === 'ADMIN' && member.role !== 'ADMIN' && (
                  <button className="text-red-600 hover:text-red-800 text-sm">
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}