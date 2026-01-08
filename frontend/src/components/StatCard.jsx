export default function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm transition-all duration-200 hover:border-purple-400 hover:shadow-md hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-2">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        {Icon && (
          <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
            <Icon className="w-6 h-6 text-purple-600" />
          </div>
        )}
      </div>
    </div>
  );
}
