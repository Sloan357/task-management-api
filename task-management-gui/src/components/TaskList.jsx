export default function TaskList({ tasks, onEdit, onDelete, onComplete }) {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'todo':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === 'done') return false;
    return new Date(dueDate) < new Date();
  };

  if (tasks.length === 0) {
    return (
      <div className="bg-white shadow-md rounded-lg p-8 text-center text-gray-500">
        No tasks found. Create your first task!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-800">{task.title}</h3>
              {task.description && (
                <p className="text-gray-600 mt-1">{task.description}</p>
              )}
            </div>
            <div className="flex gap-2 ml-4">
              {task.status !== 'done' && (
                <button
                  onClick={() => onComplete(task.id)}
                  className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition"
                  title="Mark as complete"
                >
                  ✓ Complete
                </button>
              )}
              <button
                onClick={() => onEdit(task)}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                task.status
              )}`}
            >
              {task.status.replace('_', ' ').toUpperCase()}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(
                task.priority
              )}`}
            >
              {task.priority.toUpperCase()} PRIORITY
            </span>
            {isOverdue(task.due_date, task.status) && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500 text-white">
                OVERDUE
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Due:</span> {formatDate(task.due_date)}
            </div>
            {task.tags && task.tags.length > 0 && (
              <div>
                <span className="font-medium">Tags:</span>{' '}
                {task.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-block bg-gray-200 px-2 py-0.5 rounded text-xs ml-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mt-3 text-xs text-gray-500">
            Created: {formatDate(task.created_at)} | Updated: {formatDate(task.updated_at)}
          </div>
        </div>
      ))}
    </div>
  );
}
