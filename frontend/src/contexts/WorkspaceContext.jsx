import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../api/axios';

const WorkspaceContext = createContext();

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};

export const WorkspaceProvider = ({ children }) => {
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user's workspaces on mount
  useEffect(() => {
    fetchWorkspaces();
  }, []);

  // Restore active workspace from localStorage when workspaces are loaded
  useEffect(() => {
    if (workspaces.length > 0 && !activeWorkspace) {
      const savedWorkspaceId = localStorage.getItem('activeWorkspaceId');
      
      if (savedWorkspaceId) {
        const savedWorkspace = workspaces.find(
          w => w.id === parseInt(savedWorkspaceId)
        );
        if (savedWorkspace) {
          setActiveWorkspace(savedWorkspace);
        } else {
          // Saved workspace not found, use first one
          setActiveWorkspace(workspaces[0]);
          localStorage.setItem('activeWorkspaceId', workspaces[0].id);
        }
      } else {
        // No saved workspace, use first one
        setActiveWorkspace(workspaces[0]);
        localStorage.setItem('activeWorkspaceId', workspaces[0].id);
      }
    }
  }, [workspaces, activeWorkspace]);

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/workspaces/my');
      setWorkspaces(response.data.workspaces);
    } catch (err) {
      console.error('Error fetching workspaces:', err);
      setError(err.response?.data?.message || 'Failed to load workspaces');
      setWorkspaces([]);
    } finally {
      setLoading(false);
    }
  };

  const selectWorkspace = (workspace) => {
    setActiveWorkspace(workspace);
    localStorage.setItem('activeWorkspaceId', workspace.id);
  };

  const createWorkspace = async (name) => {
    try {
      const response = await axios.post('/workspaces', { name });
      const newWorkspace = response.data.workspace;
      
      // Add to workspaces list
      setWorkspaces(prev => [...prev, newWorkspace]);
      
      // Set as active workspace
      setActiveWorkspace(newWorkspace);
      localStorage.setItem('activeWorkspaceId', newWorkspace.id);
      
      return newWorkspace;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to create workspace');
    }
  };

  const value = {
    workspaces,
    activeWorkspace,
    loading,
    error,
    selectWorkspace,
    createWorkspace,
    refreshWorkspaces: fetchWorkspaces
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};
