"""Tasks router for CRUD operations and filtering."""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from datetime import datetime
from typing import List, Optional
from app.database import get_db
from app.models.user import User
from app.models.task import Task, TaskStatus, TaskPriority
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new task for the authenticated user.

    Args:
        task_data: Task creation data
        current_user: Authenticated user
        db: Database session

    Returns:
        The created task
    """
    # Verify project belongs to user if project_id is provided
    if task_data.project_id:
        from app.models.project import Project
        project = db.query(Project).filter(
            Project.id == task_data.project_id,
            Project.user_id == current_user.id
        ).first()
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )

    db_task = Task(
        **task_data.model_dump(),
        user_id=current_user.id
    )

    db.add(db_task)
    db.commit()
    db.refresh(db_task)

    return db_task


@router.get("", response_model=List[TaskResponse])
def list_tasks(
    status_filter: Optional[TaskStatus] = Query(None, alias="status"),
    priority: Optional[TaskPriority] = None,
    project_id: Optional[int] = None,
    tags: Optional[str] = None,
    overdue: Optional[bool] = None,
    search: Optional[str] = None,
    sort_by: str = Query("created_at", regex="^(created_at|due_date|priority)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all tasks for the authenticated user with optional filtering and sorting.

    Args:
        status_filter: Filter by task status
        priority: Filter by task priority
        project_id: Filter by project ID
        tags: Comma-separated tags to filter by
        overdue: Filter overdue tasks only
        search: Search in title and description
        sort_by: Sort field (created_at, due_date, priority)
        sort_order: Sort order (asc, desc)
        current_user: Authenticated user
        db: Database session

    Returns:
        List of tasks matching the criteria
    """
    query = db.query(Task).filter(Task.user_id == current_user.id)

    # Apply filters
    if status_filter:
        query = query.filter(Task.status == status_filter)

    if priority:
        query = query.filter(Task.priority == priority)

    if project_id:
        query = query.filter(Task.project_id == project_id)

    if tags:
        tag_list = [tag.strip() for tag in tags.split(",")]
        query = query.filter(Task.tags.overlap(tag_list))

    if overdue:
        query = query.filter(
            and_(
                Task.due_date.isnot(None),
                Task.due_date < datetime.utcnow(),
                Task.status != TaskStatus.DONE
            )
        )

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                Task.title.ilike(search_filter),
                Task.description.ilike(search_filter)
            )
        )

    # Apply sorting
    if sort_by == "priority":
        # Custom priority sorting: high > medium > low
        priority_order = {
            TaskPriority.HIGH: 3,
            TaskPriority.MEDIUM: 2,
            TaskPriority.LOW: 1
        }
        tasks = query.all()
        tasks.sort(
            key=lambda t: priority_order.get(t.priority, 0),
            reverse=(sort_order == "desc")
        )
        return tasks
    else:
        order_column = getattr(Task, sort_by)
        if sort_order == "desc":
            query = query.order_by(order_column.desc())
        else:
            query = query.order_by(order_column.asc())

    return query.all()


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific task by ID.

    Args:
        task_id: Task ID
        current_user: Authenticated user
        db: Database session

    Returns:
        The requested task

    Raises:
        HTTPException: If task not found or doesn't belong to user
    """
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return task


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a task.

    Args:
        task_id: Task ID
        task_data: Updated task data
        current_user: Authenticated user
        db: Database session

    Returns:
        The updated task

    Raises:
        HTTPException: If task not found or doesn't belong to user
    """
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Verify project belongs to user if project_id is being updated
    if task_data.project_id is not None:
        from app.models.project import Project
        project = db.query(Project).filter(
            Project.id == task_data.project_id,
            Project.user_id == current_user.id
        ).first()
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )

    # Update task fields
    update_data = task_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)

    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a task.

    Args:
        task_id: Task ID
        current_user: Authenticated user
        db: Database session

    Raises:
        HTTPException: If task not found or doesn't belong to user
    """
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    db.delete(task)
    db.commit()


@router.patch("/{task_id}/complete", response_model=TaskResponse)
def complete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark a task as completed.

    Args:
        task_id: Task ID
        current_user: Authenticated user
        db: Database session

    Returns:
        The updated task

    Raises:
        HTTPException: If task not found or doesn't belong to user
    """
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    task.status = TaskStatus.DONE
    db.commit()
    db.refresh(task)

    return task
