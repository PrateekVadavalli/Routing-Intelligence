import { Home, Map, Users, Settings } from "lucide-react";

export default function Sidebar() {
  return (
    <div className="w-64 bg-green-700 text-white min-h-screen p-6">
      <h2 className="text-2xl font-bold mb-8">Routing App</h2>
      <ul className="space-y-4">
        <li className="flex items-center space-x-2 hover:bg-green-600 p-2 rounded">
          <Home size={20} /> <span>Dashboard</span>
        </li>
        <li className="flex items-center space-x-2 hover:bg-green-600 p-2 rounded">
          <Map size={20} /> <span>Routes</span>
        </li>
        <li className="flex items-center space-x-2 hover:bg-green-600 p-2 rounded">
          <Users size={20} /> <span>Drivers</span>
        </li>
        <li className="flex items-center space-x-2 hover:bg-green-600 p-2 rounded">
          <Settings size={20} /> <span>Settings</span>
        </li>
      </ul>
    </div>
  );
}
