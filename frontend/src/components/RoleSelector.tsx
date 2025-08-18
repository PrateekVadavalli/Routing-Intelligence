import React from "react";
import { useNavigate } from "react-router-dom";

const RoleSelector = () => {
  const navigate = useNavigate();

  const roles = [
    { name: "Admin", path: "/login/admin" },
    { name: "Driver", path: "/login/driver" },
    { name: "Student", path: "/login/student" },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-8">Select Your Role</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div
            key={role.name}
            className="p-6 bg-white shadow-md rounded-lg cursor-pointer hover:shadow-xl transition"
            onClick={() => navigate(role.path)}
          >
            <h2 className="text-xl font-semibold text-center">{role.name}</h2>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoleSelector;
