import { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';

export default function WorkspaceSelector() {
  const { workspaces, activeWorkspace, selectWorkspace, loading } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectWorkspace = (workspace) => {
    selectWorkspace(workspace);
    setIsOpen(false);
  };

  if (loading || !activeWorkspace) {
    return (
      <div className="px-3 py-2 bg-gray-100 rounded-lg animate-pulse">
        <div className="h-4 w-32 bg-gray-300 rounded"></div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1"
      >
        {/* Workspace Icon */}
        <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-xs font-bold">
          {activeWorkspace.name.charAt(0).toUpperCase()}
        </div>

        {/* Workspace Info */}
        <div className="flex flex-col items-start">
          <span className="text-sm font-semibold text-gray-900">
            {activeWorkspace.name}
          </span>
          <span className="text-xs text-gray-500 capitalize">
            {activeWorkspace.role.toLowerCase()}
          </span>
        </div>

        {/* Chevron Icon */}
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && workspaces.length > 0 && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Your Workspaces
            </p>
          </div>

          {/* Workspace List */}
          <div className="py-2 max-h-80 overflow-y-auto">
            {workspaces.map((workspace) => {
              const isActive = activeWorkspace?.id === workspace.id;

              return (
                <button
                  key={workspace.id}
                  onClick={() => handleSelectWorkspace(workspace)}
                  className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                    isActive ? 'bg-purple-50' : ''
                  }`}
                >
                  {/* Workspace Icon */}
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold ${
                      isActive
                        ? 'bg-gradient-to-br from-purple-600 to-purple-800'
                        : 'bg-gradient-to-br from-gray-400 to-gray-600'
                    }`}
                  >
                    {workspace.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Workspace Details */}
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-semibold ${
                          isActive ? 'text-purple-900' : 'text-gray-900'
                        }`}
                      >
                        {workspace.name}
                      </span>
                      {isActive && (
                        <svg
                          className="w-4 h-4 text-purple-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 capitalize">
                      {workspace.role.toLowerCase()}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer (Optional - for creating new workspace) */}
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
            <button className="text-xs font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Workspace
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
