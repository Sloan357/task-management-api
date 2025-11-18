# Task Management GUI

A React-based web GUI for testing the Task Management REST API.

## Features

- **Authentication**: Register and login with JWT tokens
- **Task Management**: Create, read, update, delete tasks with advanced filtering
- **Project Management**: Organize tasks into projects
- **Modern UI**: Clean interface built with Tailwind CSS
- **Real-time Validation**: Form validation and error handling

## Prerequisites

- Node.js 18+ and npm
- Task Management API running on http://localhost:8000

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to http://localhost:3000

## Usage

### Authentication
1. Register a new user or login with existing credentials
2. The JWT token will be displayed and stored in localStorage
3. All subsequent API calls will use this token

### Tasks
- **Create**: Click "+ New Task" to create a task
- **Filter**: Use the filters panel to search and filter tasks
- **Edit**: Click "Edit" on any task to modify it
- **Delete**: Click "Delete" to remove a task
- **Complete**: Click "✓ Complete" to mark a task as done

### Projects
- **Create**: Click "+ New Project" to create a project
- **View Tasks**: Click "View Tasks" to see all tasks in a project
- **Edit**: Click "Edit" to modify project details
- **Delete**: Click "Delete" to remove a project (and all its tasks)

## API Endpoints Tested

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`

### Tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks` - List tasks (with filters)
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task
- `PATCH /api/tasks/{id}/complete` - Mark complete

### Projects
- `POST /api/projects` - Create project
- `GET /api/projects` - List projects
- `GET /api/projects/{id}/tasks` - Get project tasks
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Technologies

- React 18
- Vite
- Tailwind CSS
- Axios
- Local Storage for authentication

## License

MIT
