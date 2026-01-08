const priorityColors = {
  HIGH: "bg-red-100 text-red-600",
  MEDIUM: "bg-yellow-100 text-yellow-600",
  LOW: "bg-green-100 text-green-600",
};

const TaskCard = ({ title, project, priority, status }) => {
  return (
    <div className="flex justify-between items-center bg-white border rounded-lg px-4 py-3">
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-gray-500">{project}</p>
      </div>

      <div className="flex gap-2 items-center">
        <span className={`text-xs px-2 py-1 rounded ${priorityColors[priority]}`}>
          {priority}
        </span>
        <span className="text-xs text-gray-500">{status}</span>
      </div>
    </div>
  );
};

export default TaskCard;
