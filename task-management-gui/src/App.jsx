import { useState } from 'react';
import Auth from './components/Auth';
import Tasks from './components/Tasks';
import Projects from './components/Projects';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [activeTab, setActiveTab] = useState('tasks');
  const [projects, setProjects] = useState([]);

  const handleLoginSuccess = (token) => {
    setIsAuthenticated(!!token);
    if (token) {
      setActiveTab('tasks');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Task Management</h1>
            <p className="text-gray-600">Please login or register to continue</p>
          </div>
          <Auth onLoginSuccess={handleLoginSuccess} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">Task Management System</h1>
            <div className="flex gap-2">
              <Auth onLoginSuccess={handleLoginSuccess} />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-4">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-6 py-3 font-medium border-b-2 transition ${
                activeTab === 'tasks'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Tasks
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-6 py-3 font-medium border-b-2 transition ${
                activeTab === 'projects'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Projects
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'tasks' && <Tasks projects={projects} />}
        {activeTab === 'projects' && <Projects onProjectsChange={setProjects} />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-600">
          <p>Task Management API - Testing GUI</p>
          <p className="text-sm mt-1">
            API Base: <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:8000/api</code>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
