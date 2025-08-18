import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";

export default function AdminDashboard() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 bg-[#f4f9f4] min-h-screen">
        <h1 className="text-2xl font-bold text-green-700 mb-6">Admin Dashboard</h1>

        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <StatCard title="Total Routes" value="15" />
          <StatCard title="Active Drivers" value="42" color="bg-blue-600" />
          <StatCard title="Buses on Road" value="29" color="bg-green-500" />
        </div>

        {/* Example Table */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Route Updates</h2>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-gray-600">
                <th className="py-2">Route</th>
                <th>Status</th>
                <th>Driver</th>
                <th>Last Update</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="py-2">Route 12</td>
                <td>On Schedule</td>
                <td>John D.</td>
                <td>10:15 AM</td>
              </tr>
              <tr className="border-t">
                <td className="py-2">Route 7</td>
                <td>Delayed</td>
                <td>Priya R.</td>
                <td>10:10 AM</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
