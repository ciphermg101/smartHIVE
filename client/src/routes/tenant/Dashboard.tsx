export default function TenantDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 flex flex-col items-center">
        <div className="text-2xl font-bold mb-2">$1,200</div>
        <div className="text-gray-500">Current Rent Due</div>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 flex flex-col items-center">
        <div className="text-2xl font-bold mb-2">Unit 3B</div>
        <div className="text-gray-500">Your Unit</div>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 flex flex-col items-center">
        <div className="text-2xl font-bold mb-2">1</div>
        <div className="text-gray-500">Active Issues</div>
      </div>
    </div>
  );
} 