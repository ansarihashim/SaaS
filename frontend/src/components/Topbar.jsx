import WorkspaceSelector from './WorkspaceSelector';

export default function Topbar({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h2 className="text-2xl font-semibold">{title}</h2>
        {subtitle && <p className="text-gray-500 text-sm">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <WorkspaceSelector />
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}
