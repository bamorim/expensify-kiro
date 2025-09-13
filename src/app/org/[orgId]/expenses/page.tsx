interface ExpensesPageProps {
  params: {
    orgId: string;
  };
}

export default function ExpensesPage({ params: _params }: ExpensesPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
        <p className="text-gray-600 mt-2">
          {"Manage and track your organization's expenses"}
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Expense Management Coming Soon
        </h3>
        <p className="text-gray-600">
          This feature will be implemented in upcoming tasks. You&apos;ll be able to submit, 
          review, and manage expenses here.
        </p>
      </div>
    </div>
  );
}