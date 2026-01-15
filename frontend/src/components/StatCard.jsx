import { useNavigate } from "react-router-dom";

export default function StatCard({ label, value, icon: Icon, to }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`bg-white rounded-xl p-6 border-l-4 border-l-transparent border-y border-r border-gray-100 shadow-sm transition-all duration-200 group ${
        to
          ? "cursor-pointer hover:border-l-purple-600 hover:shadow-md hover:scale-[1.01]"
          : "hover:border-l-purple-600 hover:shadow-md hover:-translate-y-0.5"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-2 font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        {Icon && (
          <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
            <Icon className="w-6 h-6 text-purple-600" />
          </div>
        )}
      </div>
    </div>
  );
}
