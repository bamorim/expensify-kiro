import { notFound } from "next/navigation";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import { OrganizationNavigation } from "~/app/_components/organization/organization-navigation";

interface OrganizationLayoutProps {
  children: React.ReactNode;
  params: {
    orgId: string;
  };
}

export default async function OrganizationLayout({ 
  children, 
  params 
}: OrganizationLayoutProps) {
  const session = await auth();
  
  if (!session?.user) {
    notFound();
  }

  let organization;
  try {
    organization = await api.organization.getById({ organizationId: params.orgId });
  } catch {
    // If user doesn't have access to this organization, show 404
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <OrganizationNavigation 
        organization={organization} 
        organizationId={params.orgId}
      />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}