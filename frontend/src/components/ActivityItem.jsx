const ActivityItem = ({ activity }) => {
  // Handle null/undefined activity
  if (!activity) return null;

  // Extract user info with fallback
  const userName = activity.user?.name || "System";
  const userEmail = activity.user?.email || "";
  
  // Generate initials from name
  const getInitials = (name) => {
    if (!name || name === "System") return "SY";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const initials = getInitials(userName);
  const message = activity.message || "No description";
  const time = activity.createdAt;

  // Format time ago
  const formatTimeAgo = (dateString) => {
    if (!dateString) return "Unknown time";
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 172800) return "1 day ago";
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="flex gap-3 items-start">
      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <strong className="text-gray-900">{userName}</strong>
          <span className="text-gray-400 mx-1.5">·</span>
          <span className="text-gray-700">{message}</span>
        </p>
        <p className="text-xs text-gray-500 mt-0.5">{formatTimeAgo(time)}</p>
      </div>
    </div>
  );
};

export default ActivityItem;
