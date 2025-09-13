interface ReportsPageProps {
  params: {
    orgId: string;
  };
}

export default function ReportsPage({ params: _params }: ReportsPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-2">
          View expense reports and analytics
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Reporting Coming Soon
        </h3>
        <p className="text-gray-600">
          This feature will be implemented in upcoming tasks. You&apos;ll be able to view 
          detailed expense reports and analytics here.
        </p>
      </div>
    </div>
  );
}