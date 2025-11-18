export default function ProjectList({ projects, onEdit, onDelete, onViewTasks }) {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (projects.length === 0) {
    return (
      <div className="bg-white shadow-md rounded-lg p-8 text-center text-gray-500">
        No projects found. Create your first project!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <div
          key={project.id}
          className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition"
          style={{ borderLeft: `4px solid ${project.color || '#3B82F6'}` }}
        >
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-semibold text-gray-800">{project.name}</h3>
            <div
              className="w-6 h-6 rounded-full border-2 border-gray-300"
              style={{ backgroundColor: project.color || '#3B82F6' }}
              title={project.color}
            />
          </div>

          {project.description && (
            <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
          )}

          <div className="text-xs text-gray-500 mb-4">
            <div>Created: {formatDate(project.created_at)}</div>
            <div>Updated: {formatDate(project.updated_at)}</div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onViewTasks(project)}
              className="flex-1 bg-purple-500 text-white px-3 py-1.5 rounded text-sm hover:bg-purple-600 transition"
            >
              View Tasks
            </button>
            <button
              onClick={() => onEdit(project)}
              className="flex-1 bg-blue-500 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-600 transition"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(project.id)}
              className="flex-1 bg-red-500 text-white px-3 py-1.5 rounded text-sm hover:bg-red-600 transition"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
