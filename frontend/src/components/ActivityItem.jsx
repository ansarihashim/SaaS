const ActivityItem = ({ user, action, time }) => {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm font-bold">
        {user[0]}
      </div>

      <div>
        <p className="text-sm">
          <strong>{user}</strong> {action}
        </p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
    </div>
  );
};

export default ActivityItem;
