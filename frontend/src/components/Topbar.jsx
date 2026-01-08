export default function Topbar({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between mb-8">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
      </div>

      {/* Action Button */}
      {action && <div>{action}</div>}
    </div>
  );
}
