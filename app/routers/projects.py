"""Projects router for CRUD operations."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.project import Project
from app.models.task import Task
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse
from app.schemas.task import TaskResponse
from app.dependencies import get_current_user

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    project_data: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new project for the authenticated user.

    Args:
        project_data: Project creation data
        current_user: Authenticated user
        db: Database session

    Returns:
        The created project
    """
    db_project = Project(
        **project_data.model_dump(),
        user_id=current_user.id
    )

    db.add(db_project)
    db.commit()
    db.refresh(db_project)

    return db_project


@router.get("", response_model=List[ProjectResponse])
def list_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all projects for the authenticated user.

    Args:
        current_user: Authenticated user
        db: Database session

    Returns:
        List of user's projects
    """
    projects = db.query(Project).filter(
        Project.user_id == current_user.id
    ).order_by(Project.created_at.desc()).all()

    return projects


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific project by ID.

    Args:
        project_id: Project ID
        current_user: Authenticated user
        db: Database session

    Returns:
        The requested project

    Raises:
        HTTPException: If project not found or doesn't belong to user
    """
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    return project


@router.get("/{project_id}/tasks", response_model=List[TaskResponse])
def get_project_tasks(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all tasks in a specific project.

    Args:
        project_id: Project ID
        current_user: Authenticated user
        db: Database session

    Returns:
        List of tasks in the project

    Raises:
        HTTPException: If project not found or doesn't belong to user
    """
    # Verify project exists and belongs to user
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Get tasks for the project
    tasks = db.query(Task).filter(
        Task.project_id == project_id,
        Task.user_id == current_user.id
    ).order_by(Task.created_at.desc()).all()

    return tasks


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    project_data: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a project.

    Args:
        project_id: Project ID
        project_data: Updated project data
        current_user: Authenticated user
        db: Database session

    Returns:
        The updated project

    Raises:
        HTTPException: If project not found or doesn't belong to user
    """
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Update project fields
    update_data = project_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)

    db.commit()
    db.refresh(project)

    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a project and all its associated tasks.

    Args:
        project_id: Project ID
        current_user: Authenticated user
        db: Database session

    Raises:
        HTTPException: If project not found or doesn't belong to user
    """
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    db.delete(project)
    db.commit()
