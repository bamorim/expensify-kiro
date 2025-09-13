interface CategoriesPageProps {
  params: {
    orgId: string;
  };
}

export default function CategoriesPage({ params: _params }: CategoriesPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
        <p className="text-gray-600 mt-2">
          Manage expense categories and policies
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Category Management Coming Soon
        </h3>
        <p className="text-gray-600">
          This feature will be implemented in upcoming tasks. You&apos;ll be able to create 
          and manage expense categories and their policies here.
        </p>
      </div>
    </div>
  );
}