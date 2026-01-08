import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import Topbar from "../components/Topbar";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { teamAPI, workspaceAPI } from "../services/api";
import { FiPlus, FiX, FiMail, FiShield, FiUser } from "react-icons/fi";

export default function Team() {
  const { activeWorkspace, loading: workspaceLoading } = useWorkspace();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (activeWorkspace) {
      fetchMembers();
    }
  }, [activeWorkspace]);

  const fetchMembers = async () => {
    if (!activeWorkspace?.id) {
      setMembers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await teamAPI.getMembers(activeWorkspace.id);
      setMembers(response.data.users || []);
    } catch (err) {
      console.error("Error fetching team members:", err);
      setError(err.response?.data?.message || "Server error");
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (formData) => {
    try {
      setInviting(true);
      const response = await teamAPI.inviteMember(formData.workspaceId, {
        email: formData.email,
        role: formData.role
      });
      setShowInviteModal(false);
      
      // Check if email was sent successfully
      if (response.data.emailSent === false) {
        alert(`✅ User added to workspace\n\n⚠️ Warning: ${response.data.emailError || 'Invitation email could not be sent'}\n\nPlease notify the user manually.`);
      } else {
        alert('✅ User invited successfully! Invitation email sent.');
      }
      
      // Refresh members if invited to current workspace
      if (formData.workspaceId === activeWorkspace.id) {
        await fetchMembers();
      }
    } catch (err) {
      console.error("Error inviting member:", err);
      alert(err.response?.data?.message || "Failed to invite member");
    } finally {
      setInviting(false);
    }
  };

  if (workspaceLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading workspace...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!activeWorkspace) {
    return (
      <DashboardLayout>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            No Workspace Selected
          </h3>
          <p className="text-yellow-700">
            Please select a workspace to view team members.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  // Check if user can invite members (OWNER or ADMIN only)
  const canInvite = activeWorkspace.role === "OWNER" || activeWorkspace.role === "ADMIN";

  return (
    <DashboardLayout>
      <Topbar
        title="Team Members"
        subtitle={`Manage team in ${activeWorkspace.name}`}
      />

      {/* Invite Member Modal */}
      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSubmit={handleInvite}
        loading={inviting}
        currentWorkspace={activeWorkspace}
      />

      <div className="p-6">
        {/* Invite Member Button */}
        {canInvite && (
          <div className="mb-6">
            <button 
              onClick={() => setShowInviteModal(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 hover:shadow-md active:scale-95 transition-all duration-200 flex items-center gap-2"
            >
              <FiPlus className="w-5 h-5" />
              <span>Invite Member</span>
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
              <p className="text-gray-500">Loading team members...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Team</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && members.length === 0 && (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <FiUser className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Team Members Yet</h3>
            <p className="text-gray-500 mb-4">
              {canInvite
                ? "Invite team members to collaborate on projects."
                : "Waiting for team members to join."}
            </p>
            {canInvite && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Invite Your First Member
              </button>
            )}
          </div>
        )}

        {/* Team Members Table */}
        {!loading && !error && members.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {members.map((member) => (
                    <MemberRow key={member.id} member={member} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function MemberRow({ member }) {
  // Generate avatar initials
  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Role badge colors
  const getRoleBadge = (role) => {
    const badges = {
      OWNER: "bg-purple-100 text-purple-800",
      ADMIN: "bg-blue-100 text-blue-800",
      MEMBER: "bg-gray-100 text-gray-800",
    };
    return badges[role] || badges.MEMBER;
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-semibold text-sm shrink-0">
            {getInitials(member.name)}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{member.name}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FiMail className="w-4 h-4" />
          {member.email}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(
            member.role
          )}`}
        >
          <FiShield className="w-3 h-3" />
          {member.role}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Active
        </span>
      </td>
    </tr>
  );
}

function InviteMemberModal({ isOpen, onClose, onSubmit, loading, currentWorkspace }) {
  const [workspaces, setWorkspaces] = useState([]);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);
  const [formData, setFormData] = useState({
    workspaceId: "",
    email: "",
    role: "MEMBER",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetchUserWorkspaces();
    }
  }, [isOpen]);

  useEffect(() => {
    // Set current workspace as default when workspaces load
    if (currentWorkspace && workspaces.length > 0 && !formData.workspaceId) {
      setFormData(prev => ({ ...prev, workspaceId: currentWorkspace.id }));
    }
  }, [currentWorkspace, workspaces, formData.workspaceId]);

  const fetchUserWorkspaces = async () => {
    try {
      setLoadingWorkspaces(true);
      const response = await workspaceAPI.getMy();
      // Filter only workspaces where user is OWNER or ADMIN
      const adminWorkspaces = (response.data.workspaces || []).filter(
        ws => ws.role === "OWNER" || ws.role === "ADMIN"
      );
      setWorkspaces(adminWorkspaces);
      
      // Set current workspace as default
      if (currentWorkspace) {
        setFormData(prev => ({ ...prev, workspaceId: currentWorkspace.id }));
      }
    } catch (err) {
      console.error("Error fetching workspaces:", err);
    } finally {
      setLoadingWorkspaces(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validation
    const newErrors = {};
    if (!formData.workspaceId) {
      newErrors.workspaceId = "Please select a workspace";
    }
    if (!formData.email || !formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      workspaceId: parseInt(formData.workspaceId),
      email: formData.email.trim(),
      role: formData.role,
    });
  };

  const handleClose = () => {
    setFormData({ 
      workspaceId: currentWorkspace?.id || "", 
      email: "", 
      role: "MEMBER" 
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Invite Team Member</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Workspace Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Workspace <span className="text-red-500">*</span>
            </label>
            {loadingWorkspaces ? (
              <div className="text-sm text-gray-500">Loading workspaces...</div>
            ) : (
              <select
                value={formData.workspaceId}
                onChange={(e) =>
                  setFormData({ ...formData, workspaceId: e.target.value })
                }
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.workspaceId ? "border-red-500" : "border-gray-300"
                }`}
                disabled={loading || workspaces.length === 0}
              >
                <option value="">Choose a workspace...</option>
                {workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    {ws.name} ({ws.role})
                  </option>
                ))}
              </select>
            )}
            {errors.workspaceId && (
              <p className="text-red-500 text-sm mt-1">{errors.workspaceId}</p>
            )}
            {workspaces.length === 0 && !loadingWorkspaces && (
              <p className="text-yellow-600 text-sm mt-1">
                You don't have admin access to any workspace
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="member@example.com"
              disabled={loading}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={loading}
            >
              <option value="MEMBER">Member (Read & Execute)</option>
              <option value="ADMIN">Admin (Full Access)</option>
            </select>
            <p className="text-xs text-gray-500 mt-2">
              💡 Invited members get access to all workspace projects and tasks
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || workspaces.length === 0}
            >
              {loading ? "Inviting..." : "Send Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
