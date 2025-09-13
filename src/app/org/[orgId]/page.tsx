import { notFound } from "next/navigation";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import { OrganizationDashboard } from "~/app/_components/organization/organization-dashboard";

interface OrganizationPageProps {
  params: {
    orgId: string;
  };
}

export default async function OrganizationPage({ params }: OrganizationPageProps) {
  const session = await auth();
  
  if (!session?.user) {
    notFound();
  }

  try {
    // Prefetch organization data
    void api.organization.getById.prefetch({ organizationId: params.orgId });
    void api.organization.listMembers.prefetch({ organizationId: params.orgId });
  } catch {
    // If user doesn't have access to this organization, show 404
    notFound();
  }

  return (
    <HydrateClient>
      <OrganizationDashboard organizationId={params.orgId} />
    </HydrateClient>
  );
}