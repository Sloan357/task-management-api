import { useState, useEffect } from 'react';
import { projectsAPI } from '../services/api';
import ProjectForm from './ProjectForm';
import ProjectList from './ProjectList';

export default function Projects({ onProjectsChange }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [viewingProject, setViewingProject] = useState(null);
  const [projectTasks, setProjectTasks] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await projectsAPI.list();
      setProjects(data);
      onProjectsChange(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (projectData) => {
    try {
      await projectsAPI.create(projectData);
      setSuccess('Project created successfully!');
      setShowForm(false);
      fetchProjects();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create project');
      throw err;
    }
  };

  const handleUpdateProject = async (projectId, projectData) => {
    try {
      await projectsAPI.update(projectId, projectData);
      setSuccess('Project updated successfully!');
      setEditingProject(null);
      fetchProjects();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update project');
      throw err;
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure? This will delete all tasks in this project!')) return;

    try {
      await projectsAPI.delete(projectId);
      setSuccess('Project deleted successfully!');
      fetchProjects();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete project');
    }
  };

  const handleViewProjectTasks = async (project) => {
    setViewingProject(project);
    try {
      const tasks = await projectsAPI.getTasks(project.id);
      setProjectTasks(tasks);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch project tasks');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Projects</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          {showForm ? 'Cancel' : '+ New Project'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {showForm && (
        <ProjectForm
          onSubmit={handleCreateProject}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingProject && (
        <ProjectForm
          project={editingProject}
          onSubmit={(data) => handleUpdateProject(editingProject.id, data)}
          onCancel={() => setEditingProject(null)}
        />
      )}

      {viewingProject && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">
              Tasks in "{viewingProject.name}"
            </h3>
            <button
              onClick={() => setViewingProject(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕ Close
            </button>
          </div>
          {projectTasks.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No tasks in this project</p>
          ) : (
            <div className="space-y-2">
              {projectTasks.map((task) => (
                <div
                  key={task.id}
                  className="border border-gray-200 rounded p-3 hover:bg-gray-50"
                >
                  <div className="font-semibold">{task.title}</div>
                  <div className="text-sm text-gray-600">
                    Status: {task.status} | Priority: {task.priority}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading projects...</p>
        </div>
      ) : (
        <ProjectList
          projects={projects}
          onEdit={setEditingProject}
          onDelete={handleDeleteProject}
          onViewTasks={handleViewProjectTasks}
        />
      )}
    </div>
  );
}
