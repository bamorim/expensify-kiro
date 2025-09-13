import Link from "next/link";

import { CreateOrganizationForm, OrganizationList } from "~/app/_components/organization";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    void api.organization.listByUser.prefetch();
  }

  return (
    <HydrateClient>
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Expensify
            </h1>
            <p className="text-gray-600">
              Smart expense management for your organization
            </p>
          </header>

          <div className="flex flex-col items-center justify-center gap-8">
            <div className="flex flex-col items-center justify-center gap-4">
              <p className="text-center text-xl text-gray-700">
                {session && <span>Welcome, {session.user?.name}</span>}
              </p>
              <Link
                href={session ? "/api/auth/signout" : "/api/auth/signin"}
                className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white no-underline transition hover:bg-blue-700"
              >
                {session ? "Sign out" : "Sign in"}
              </Link>
            </div>

            {session?.user && (
              <div className="w-full max-w-4xl space-y-8">
                <div className="flex flex-col gap-6">
                  <CreateOrganizationForm />
                  <OrganizationList />
                </div>
              </div>
            )}

            {!session?.user && (
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Please sign in to manage your organizations and expenses.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
