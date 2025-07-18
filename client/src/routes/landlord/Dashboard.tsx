export default function LandlordDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 flex flex-col items-center">
        <div className="text-2xl font-bold mb-2">$12,500</div>
        <div className="text-gray-500">Total Rent Collected</div>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 flex flex-col items-center">
        <div className="text-2xl font-bold mb-2">8</div>
        <div className="text-gray-500">Active Tenants</div>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 flex flex-col items-center">
        <div className="text-2xl font-bold mb-2">3</div>
        <div className="text-gray-500">Pending Issues</div>
      </div>
    </div>
  );
} 