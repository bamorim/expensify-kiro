import { api, HydrateClient } from "~/trpc/server";
import { MembersList } from "~/app/_components/organization/members-list";

interface MembersPageProps {
  params: {
    orgId: string;
  };
}

export default async function MembersPage({ params }: MembersPageProps) {
  // Prefetch members data
  void api.organization.listMembers.prefetch({ organizationId: params.orgId });

  return (
    <HydrateClient>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Members</h1>
          <p className="text-gray-600 mt-2">
            Manage organization members and their roles
          </p>
        </div>

        <MembersList organizationId={params.orgId} />
      </div>
    </HydrateClient>
  );
}