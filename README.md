# Task Management REST API

A production-ready REST API for task and project management built with FastAPI, PostgreSQL, and JWT authentication.

## Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Task Management**: Full CRUD operations with advanced filtering and sorting
- **Project Organization**: Group tasks into projects
- **Advanced Filtering**: Filter tasks by status, priority, project, tags, due date, and search
- **RESTful Design**: Clean, intuitive API endpoints
- **Auto-generated Documentation**: Interactive Swagger UI and ReDoc

## Tech Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Validation**: Pydantic
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: Bcrypt
- **Migrations**: Alembic
- **ASGI Server**: Uvicorn

## Project Structure

```
task-management-api/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Configuration and settings
│   ├── database.py          # Database connection and session
│   ├── dependencies.py      # FastAPI dependencies
│   ├── models/              # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── task.py
│   │   └── project.py
│   ├── schemas/             # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── task.py
│   │   └── project.py
│   ├── routers/             # API route handlers
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── tasks.py
│   │   └── projects.py
│   └── utils/               # Utility functions
│       ├── __init__.py
│       └── auth.py          # JWT and password utilities
├── alembic/                 # Database migrations
│   ├── versions/
│   └── env.py
├── alembic.ini
├── requirements.txt
├── .env.example
└── README.md
```

## Setup Instructions

### Prerequisites

- Python 3.9+
- PostgreSQL 12+
- pip

### 1. Clone the Repository

```bash
git clone <repository-url>
cd task-management-api
```

### 2. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Set Up PostgreSQL Database

Create a PostgreSQL database:

```sql
CREATE DATABASE taskdb;
CREATE USER taskuser WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE taskdb TO taskuser;
```

### 5. Configure Environment Variables

Copy the example environment file and update it with your settings:

```bash
cp .env.example .env
```

Edit `.env` and update the following variables:

```env
DATABASE_URL=postgresql://taskuser:your_password@localhost:5432/taskdb
JWT_SECRET_KEY=your-secret-key-here  # Generate with: openssl rand -hex 32
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
APP_NAME=Task Management API
DEBUG=False
```

### 6. Run Database Migrations

```bash
alembic upgrade head
```

### 7. Start the Server

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, visit:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Authentication

#### Register a New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/x-www-form-urlencoded

username=johndoe&password=securepassword123
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Tasks

All task endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_token>
```

#### Create a Task
```http
POST /api/tasks
Content-Type: application/json

{
  "title": "Complete project documentation",
  "description": "Write comprehensive README and API docs",
  "status": "todo",
  "priority": "high",
  "due_date": "2024-12-31T23:59:59Z",
  "tags": ["documentation", "urgent"],
  "project_id": 1
}
```

#### List All Tasks (with filtering)
```http
GET /api/tasks?status=todo&priority=high&sort_by=due_date&sort_order=asc
```

**Query Parameters:**
- `status`: Filter by status (todo, in_progress, done)
- `priority`: Filter by priority (low, medium, high)
- `project_id`: Filter by project ID
- `tags`: Comma-separated tags (e.g., "urgent,important")
- `overdue`: Boolean - show only overdue tasks
- `search`: Search in title and description
- `sort_by`: Sort field (created_at, due_date, priority)
- `sort_order`: Sort order (asc, desc)

#### Get a Specific Task
```http
GET /api/tasks/{task_id}
```

#### Update a Task
```http
PUT /api/tasks/{task_id}
Content-Type: application/json

{
  "title": "Updated title",
  "status": "in_progress",
  "priority": "medium"
}
```

#### Delete a Task
```http
DELETE /api/tasks/{task_id}
```

#### Mark Task as Complete
```http
PATCH /api/tasks/{task_id}/complete
```

### Projects

#### Create a Project
```http
POST /api/projects
Content-Type: application/json

{
  "name": "Website Redesign",
  "description": "Complete redesign of company website",
  "color": "#FF5733"
}
```

#### List All Projects
```http
GET /api/projects
```

#### Get a Specific Project
```http
GET /api/projects/{project_id}
```

#### Get All Tasks in a Project
```http
GET /api/projects/{project_id}/tasks
```

#### Update a Project
```http
PUT /api/projects/{project_id}
Content-Type: application/json

{
  "name": "Updated Project Name",
  "color": "#00FF00"
}
```

#### Delete a Project
```http
DELETE /api/projects/{project_id}
```

## Data Models

### User
- `id`: Integer (auto-generated)
- `username`: String (unique, 3-50 chars)
- `email`: String (unique, valid email)
- `hashed_password`: String
- `created_at`: DateTime
- `updated_at`: DateTime

### Task
- `id`: Integer (auto-generated)
- `title`: String (required, max 200 chars)
- `description`: Text (optional)
- `status`: Enum (todo, in_progress, done)
- `priority`: Enum (low, medium, high)
- `due_date`: DateTime (optional)
- `tags`: Array of strings
- `project_id`: Integer (optional, foreign key)
- `user_id`: Integer (foreign key)
- `created_at`: DateTime
- `updated_at`: DateTime

### Project
- `id`: Integer (auto-generated)
- `name`: String (required, max 200 chars)
- `description`: Text (optional)
- `color`: String (hex color code, e.g., #FF5733)
- `user_id`: Integer (foreign key)
- `created_at`: DateTime
- `updated_at`: DateTime

## Security

- Passwords are hashed using bcrypt
- JWT tokens expire after 30 minutes (configurable)
- All task and project endpoints require authentication
- Users can only access their own data
- SQL injection protection via SQLAlchemy ORM
- Input validation via Pydantic schemas

## Error Handling

The API returns appropriate HTTP status codes:

- `200 OK`: Successful GET, PUT, PATCH requests
- `201 Created`: Successful POST requests
- `204 No Content`: Successful DELETE requests
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid authentication
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server errors

Error responses include a `detail` field with error information:

```json
{
  "detail": "Task not found"
}
```

## Development

### Running Tests

```bash
pytest
```

### Database Migrations

Create a new migration after model changes:

```bash
alembic revision --autogenerate -m "Description of changes"
```

Apply migrations:

```bash
alembic upgrade head
```

Rollback migration:

```bash
alembic downgrade -1
```

### Production Deployment

1. Set `DEBUG=False` in environment variables
2. Use a production-grade ASGI server (e.g., Gunicorn with Uvicorn workers)
3. Set up proper CORS configuration
4. Use environment-specific secrets
5. Enable HTTPS
6. Set up database connection pooling
7. Configure logging and monitoring

Example production command:

```bash
gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET_KEY` | Secret key for JWT encoding | Required |
| `JWT_ALGORITHM` | JWT algorithm | HS256 |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration time | 30 |
| `APP_NAME` | Application name | Task Management API |
| `DEBUG` | Debug mode | False |

## License

MIT License

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Support

For issues and questions, please open an issue on the GitHub repository.
