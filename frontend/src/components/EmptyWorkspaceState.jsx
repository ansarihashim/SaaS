import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '../contexts/WorkspaceContext';
import CreateWorkspaceModal from './modals/CreateWorkspaceModal';
import { FiPlus } from 'react-icons/fi';

export default function EmptyWorkspaceState() {
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const { createWorkspace } = useWorkspace();
  const navigate = useNavigate();

  const handleCreateWorkspace = async (name) => {
    try {
      setCreating(true);
      setError('');
      
      // Create workspace (WorkspaceContext automatically sets it as active)
      await createWorkspace(name);
      
      // Close modal
      setShowModal(false);
      
      // Navigate to dashboard
      navigate('/');
    } catch (err) {
      console.error('Error creating workspace:', err);
      setError(err.message || 'Failed to create workspace');
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <div className="max-w-md w-full">
          {/* Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 text-white mb-6 shadow-lg">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to TaskFlow</h1>
            <p className="text-gray-600">You don't have any workspaces yet</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Get Started</h2>
            <p className="text-gray-600 mb-6">
              Create your first workspace to start managing projects, tasks, and collaborating with your team.
            </p>

            {/* Error Message */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Create Button */}
            <button
              onClick={() => setShowModal(true)}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <FiPlus className="w-5 h-5" />
              Create Your First Workspace
            </button>

            {/* Features List */}
            <div className="mt-8 space-y-3">
              <p className="text-sm font-medium text-gray-700 mb-3">With workspaces you can:</p>
              {[
                'Organize projects and tasks',
                'Collaborate with team members',
                'Track activity and progress',
                'Manage multiple teams separately'
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleCreateWorkspace}
        loading={creating}
      />
    </>
  );
}
