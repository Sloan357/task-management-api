import { useState, useEffect } from 'react';
import { tasksAPI } from '../services/api';
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import TaskFilters from './TaskFilters';

export default function Tasks({ projects }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    project_id: '',
    search: '',
    sort_by: 'created_at',
    sort_order: 'desc',
  });

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          params[key] = filters[key];
        }
      });
      const data = await tasksAPI.list(params);
      setTasks(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      await tasksAPI.create(taskData);
      setSuccess('Task created successfully!');
      setShowForm(false);
      fetchTasks();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create task');
      throw err;
    }
  };

  const handleUpdateTask = async (taskId, taskData) => {
    try {
      await tasksAPI.update(taskId, taskData);
      setSuccess('Task updated successfully!');
      setEditingTask(null);
      fetchTasks();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update task');
      throw err;
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await tasksAPI.delete(taskId);
      setSuccess('Task deleted successfully!');
      fetchTasks();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete task');
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await tasksAPI.complete(taskId);
      setSuccess('Task marked as complete!');
      fetchTasks();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to complete task');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Tasks</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          {showForm ? 'Cancel' : '+ New Task'}
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
        <TaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setShowForm(false)}
          projects={projects}
        />
      )}

      {editingTask && (
        <TaskForm
          task={editingTask}
          onSubmit={(data) => handleUpdateTask(editingTask.id, data)}
          onCancel={() => setEditingTask(null)}
          projects={projects}
        />
      )}

      <TaskFilters filters={filters} onFilterChange={setFilters} projects={projects} />

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading tasks...</p>
        </div>
      ) : (
        <TaskList
          tasks={tasks}
          onEdit={setEditingTask}
          onDelete={handleDeleteTask}
          onComplete={handleCompleteTask}
        />
      )}
    </div>
  );
}
