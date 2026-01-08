export default function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
      <p className="text-sm text-gray-500 mb-2">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
