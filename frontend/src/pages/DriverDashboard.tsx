import Sidebar from "../components/Sidebar";

export default function DriverDashboard() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 bg-[#f4f9f4] min-h-screen">
        <h1 className="text-2xl font-bold text-green-700 mb-6">Driver Dashboard</h1>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-lg mb-4">Today’s Route</h2>
          <p><strong>Route:</strong> 14</p>
          <p><strong>Stops:</strong> 12</p>
          <p><strong>Status:</strong> On Time</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6 mt-6">
          <h2 className="font-semibold text-lg mb-4">Updates</h2>
          <p>Next Stop: School Gate (ETA 10 min)</p>
        </div>
      </main>
    </div>
  );
}
