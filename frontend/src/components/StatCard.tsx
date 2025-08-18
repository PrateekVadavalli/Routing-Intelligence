interface StatCardProps {
  title: string;
  value: string | number;
  color?: string;
}

export default function StatCard({ title, value, color = "bg-green-700" }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className={`text-2xl font-bold mt-2 ${color === "bg-green-700" ? "text-green-700" : ""}`}>
        {value}
      </h2>
    </div>
  );
}
