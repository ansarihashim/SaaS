import { FiMenu } from 'react-icons/fi';
import WorkspaceSelector from './WorkspaceSelector';
import { useSidebar } from '../layouts/DashboardLayout';

export default function Topbar({ title, subtitle, action }) {
  const { toggleSidebar } = useSidebar();

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        {/* Hamburger Menu */}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors text-gray-600 hover:text-gray-900"
          aria-label="Toggle sidebar"
        >
          <FiMenu className="w-6 h-6" />
        </button>

        {/* Title */}
        <div>
          <h2 className="text-2xl font-semibold">{title}</h2>
          {subtitle && <p className="text-gray-500 text-sm">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <WorkspaceSelector />
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}
