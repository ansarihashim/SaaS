import { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import CreateWorkspaceModal from './modals/CreateWorkspaceModal';

export default function WorkspaceSelector() {
  const { workspaces = [], activeWorkspace, selectWorkspace, loading, createWorkspace } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
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
    if (!workspace || !selectWorkspace) return;
    selectWorkspace(workspace);
    setIsOpen(false);
  };

  const handleCreateWorkspace = async (name) => {
    if (!createWorkspace) return;
    
    try {
      setCreating(true);
      await createWorkspace(name);
      setShowCreateModal(false);
      setIsOpen(false);
    } catch (err) {
      console.error('Error creating workspace:', err);
      // Error is handled in the modal
    } finally {
      setCreating(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="px-3 py-2 bg-gray-100 rounded-lg animate-pulse">
        <div className="h-4 w-32 bg-gray-300 rounded"></div>
      </div>
    );
  }

  // No active workspace - show placeholder
  if (!activeWorkspace) {
    return (
      <div className="px-3 py-2 bg-gray-100 rounded-lg">
        <div className="text-sm text-gray-500">No workspace</div>
      </div>
    );
  }

  // Safe access to activeWorkspace properties with fallbacks
  const workspaceName = activeWorkspace?.name || 'Workspace';
  const workspaceRole = activeWorkspace?.role || 'Member';
  const workspaceInitial = workspaceName.charAt(0).toUpperCase() || 'W';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1"
      >
        {/* Workspace Icon */}
        <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-xs font-bold">
          {workspaceInitial}
        </div>

        {/* Workspace Info */}
        <div className="flex flex-col items-start">
          <span className="text-sm font-semibold text-gray-900">
            {workspaceName}
          </span>
          <span className="text-xs text-gray-500 capitalize">
            {workspaceRole.toLowerCase()}
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
      {isOpen && Array.isArray(workspaces) && workspaces.length > 0 && (
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
              // Safety checks for workspace object
              if (!workspace || !workspace.id) return null;
              
              const isActive = activeWorkspace?.id === workspace.id;
              const wsName = workspace.name || 'Unnamed';
              const wsRole = workspace.role || 'Member';
              const wsInitial = wsName.charAt(0).toUpperCase() || 'W';

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
                    {wsInitial}
                  </div>

                  {/* Workspace Details */}
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-semibold ${
                          isActive ? 'text-purple-900' : 'text-gray-900'
                        }`}
                      >
                        {wsName}
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
                      {wsRole.toLowerCase()}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer - Create New Workspace */}
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
            <button 
              onClick={() => {
                setIsOpen(false);
                setShowCreateModal(true);
              }}
              className="text-xs font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Workspace
            </button>
          </div>
        </div>
      )}

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateWorkspace}
        loading={creating}
      />
    </div>
  );
}
