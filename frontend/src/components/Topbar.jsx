export default function Topbar({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between mb-8">
      {/* Title */}
      <div className="text-left">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
      </div>

      {/* Action Button */}
      {action && <div>{action}</div>}
    </div>
  );
}
