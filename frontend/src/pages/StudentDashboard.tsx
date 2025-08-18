import Sidebar from "../components/Sidebar";

export default function StudentDashboard() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 bg-[#f4f9f4] min-h-screen">
        <h1 className="text-2xl font-bold text-green-700 mb-6">Student Dashboard</h1>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-lg mb-4">Live Bus Tracking</h2>
          <div className="bg-gray-100 h-64 flex items-center justify-center rounded-lg">
            [Map Placeholder]
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 mt-6">
          <h2 className="font-semibold text-lg mb-4">Notifications</h2>
          <ul className="space-y-2">
            <li className="p-2 border rounded">Bus 14 is 5 min away</li>
            <li className="p-2 border rounded">Route updated: Stop A merged with Stop B</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
