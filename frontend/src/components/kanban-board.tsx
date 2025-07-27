"use client"

import { useState, useMemo } from "react"
import { Search, Bell, Plus, FileText, ChevronDown } from "lucide-react"
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { createPortal } from "react-dom"

import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import KanbanColumn from "./kanban-column"
import TaskCard from "./task-card"
import CreateTaskModal from "./create-task-modal"
import EditTaskModal from "./edit-task-modal"
import DeleteTaskModal from "./delete-task-modal"
import { Task, Column, Filters } from "@/types/index"



const KanbanBoard = () => {
  const [tasks, setTasks] = useState<Task[]>(
    [
    {
      id: "1",
      title: "Set up authentication system",
      description: "Implement user login and registration functionality",
      status: "todo",
      priority: "medium",
      assigneeId: "user-1",
      dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
    },
    {
      id: "2",
      title: "Design landing page mockup",
      description: "Create wireframes and visual design for the new landing page",
      status: "todo",
      priority: "high",
      assigneeId: "user-2",
      dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
    },
    {
      id: "3",
      title: "Implement drag and drop",
      description: "Add drag and drop functionality to kanban board",
      status: "in_progress",
      priority: "medium",
      assigneeId: "user-3",
      dueDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
    },
    {
      id: "4",
      title: "API integration",
      description: "Connect frontend with backend API endpoints",
      status: "in_progress",
      priority: "high",
      assigneeId: "user-1",
      dueDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
    },
    {
      id: "5",
      title: "User testing",
      description: "Conduct user testing sessions and gather feedback",
      status: "done",
      priority: "medium",
      assigneeId: "user-2",
      dueDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(),
    },
    {
      id: "6",
      title: "Bug fixes",
      description: "Address reported issues and bugs",
      status: "done",
      priority: "high",
      assigneeId: "user-3",
      dueDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
    },
    {
      id: "7",
      title: "Code review process",
      description: "Establish code review guidelines and process",
      status: "todo",
      priority: "low",
      assigneeId: "user-1",
      dueDate: new Date(new Date().setDate(new Date().getDate() + 8)).toISOString(),
    },
    {
      id: "8",
      title: "Documentation",
      description: "Write technical documentation and API references",
      status: "in_progress",
      priority: "low",
      assigneeId: "user-2",
      dueDate: new Date(new Date().setDate(new Date().getDate() + 6)).toISOString(),
    },
    {
      id: "9",
      title: "Implement drag and drop",
      description: "Add drag and drop functionality to kanban board",
      status: "in_progress",
      priority: "medium",
      assigneeId: "user-3",
      dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
    },
    {
      id: "10",
      title: "Build task management API",
      description: "Create REST endpoints for CRUD operations on tasks",
      status: "in_progress",
      priority: "high",
      assigneeId: "user-4",
      dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
    },
    {
      id: "11",
      title: "Deploy to production",
      description: "Set up production environment and deploy application",
      status: "done",
      priority: "medium",
      assigneeId: "user-5",
      dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
    },
    {
      id: "12",
      title: "Write project documentation",
      description: "Create comprehensive documentation for the project",
      status: "done",
      priority: "low",
      assigneeId: "user-6",
      dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
    },
    {
      id: "13",
      title: "Code review process",
      description: "Establish code review guidelines and process",
      status: "todo",
      priority: "low",
      assigneeId: "user-1",
      dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
    },
    {
      id: "14",
      title: "Database optimization",
      description: "Optimize database queries for better performance",
      status: "in_progress",
      priority: "high",
      assigneeId: "user-2",
      dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
    },
  ]
)

  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    priority: "all-priorities",
    assignee: "all-assignees",
    status: "all-status",
    search: "",
  })

  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)

  const columns: Column[] = [
    { id: "todo", title: "To Do" },
    { id: "in_progress", title: "In Progress" },
    { id: "done", title: "Done" },
  ]

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  )

  // Get unique assignees and priorities from tasks
  const uniqueAssignees = useMemo(() => {
    const assignees = [...new Set(tasks.map((task) => task.assigneeId))].sort()
    return assignees
  }, [tasks])

  const uniquePriorities = useMemo(() => {
    const priorities = [...new Set(tasks.map((task) => task.priority))]
    return priorities.sort()
  }, [tasks])

  // Filter tasks based on current filters
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch =
          task.title.toLowerCase().includes(searchLower) ||
          (task.description?.toLowerCase() || '').includes(searchLower) ||
          task.assigneeId.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      // Priority filter
      if (filters.priority !== "all-priorities" && task.priority !== filters.priority) {
        return false
      }

      // Assignee filter
      if (filters.assignee !== "all-assignees" && task.assigneeId !== filters.assignee) {
        return false
      }

      // Status filter
      if (filters.status !== "all-status" && task.status !== filters.status) {
        return false
      }

      return true
    })
  }, [tasks, filters])

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const task = tasks.find((t) => t.id === active.id)
    if (task) setActiveTask(task)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeTask = tasks.find((task) => task.id === activeId)
    if (!activeTask) return

    // Check if we're over a column and it's different from current status
    if (columns.some((col) => col.id === overId) && activeTask.status !== overId) {
      setTasks((tasks) =>
        tasks.map((task) =>
          task.id === activeId
            ? {
                ...task,
                status: overId as "todo" | "in_progress" | "done",
                priority: task.priority,
              }
            : task,
        ),
      )
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // If dropping on the same item, do nothing
    if (activeId === overId) return

    const activeTask = tasks.find((task) => task.id === activeId)
    if (!activeTask) return

    // Handle dropping on a column
    if (columns.some((col) => col.id === overId)) {
      setTasks((tasks) =>
        tasks.map((task) =>
          task.id === activeId
            ? {
                ...task,
                status: overId as "todo" | "in_progress" | "done",
                priority: task.priority,
              }
            : task,
        ),
      )
    }
    // Handle dropping on another task (reorder within column or move to different column)
    else {
      const overTask = tasks.find((task) => task.id === overId)
      if (overTask) {
        setTasks((prevTasks) => {
          const activeIndex = prevTasks.findIndex((task) => task.id === activeId)
          const overIndex = prevTasks.findIndex((task) => task.id === overId)

          // If same column, reorder (status stays the same)
          if (activeTask.status === overTask.status) {
            const newTasks = [...prevTasks]
            // Remove the active task
            const [movedTask] = newTasks.splice(activeIndex, 1)
            // Insert at the new position
            newTasks.splice(overIndex, 0, movedTask)
            return newTasks
          } else {
            // Different column - move to target column and update status
            const newTasks = [...prevTasks]
            const updatedActiveTask = {
              ...activeTask,
              status: overTask.status, // Update status to match target column
            }

            // Remove from current position
            newTasks.splice(activeIndex, 1)
            // Insert at target position
            newTasks.splice(overIndex, 0, updatedActiveTask)
            return newTasks
          }
        })
      }
    }
  }

  const addDemoTasks = () => {
    const newTasks: Task[] = [
      {
        id: `demo-${Date.now()}-1`,
        title: "Review code changes",
        description: "Review and approve pending pull requests",
        status: "todo",
        priority: "high",
        assigneeId: "user-4",
        dueDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
      },
      {
        id: `demo-${Date.now()}-2`,
        title: "Update documentation",
        description: "Update API documentation with new endpoints",
        status: "in_progress",
        priority: "medium",
        assigneeId: "user-5",
        dueDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
      },
      {
        id: `demo-${Date.now()}-3`,
        title: "Security audit",
        description: "Conduct security audit of the application",
        status: "todo",
        priority: "high",
        assigneeId: "user-6",
        dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
      },
    ]
    setTasks((prev) => [...prev, ...newTasks])
  }

  const handleCreateTask = (taskData: Omit<Task, "id">) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      ...taskData,
    }
    setTasks((prev) => [...prev, newTask])
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
  }

  const handleDeleteTask = (task: Task) => {
    setDeletingTask(task)
  }

  const handleUpdateTask = (updatedTask: Omit<Task, "id">) => {
    if (editingTask) {
      setTasks((prev) => prev.map((task) => (task.id === editingTask.id ? { ...task, ...updatedTask } : task)))
      setEditingTask(null)
    }
  }

  const handleConfirmDelete = () => {
    if (deletingTask) {
      setTasks((prev) => prev.filter((task) => task.id !== deletingTask.id))
      setDeletingTask(null)
    }
  }

  const getTasksByStatus = (status: string) => {
    return filteredTasks
      .filter((task) => task.status === status)
      .sort((a, b) => {
        // Maintain the original order from the tasks array
        const aIndex = tasks.findIndex((task) => task.id === a.id)
        const bIndex = tasks.findIndex((task) => task.id === b.id)
        return aIndex - bIndex
      })
  }

  const handleFilterChange = (filterType: keyof Filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }))
  }

  const clearFilters = () => {
    setFilters({
      priority: "all-priorities",
      assignee: "all-assignees",
      status: "all-status",
      search: "",
    })
  }

  const hasActiveFilters =
    filters.priority !== "all-priorities" ||
    filters.assignee !== "all-assignees" ||
    filters.status !== "all-status" ||
    filters.search !== ""

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center text-blue-500 font-bold text-xl">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect width="3" height="3" x="9" y="9" />
              <rect width="3" height="3" x="15" y="9" />
              <rect width="3" height="3" x="9" y="15" />
              <rect width="3" height="3" x="15" y="15" />
            </svg>
            TaskFlow
          </div>

          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search tasks..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border-gray-200 rounded-lg focus:bg-white focus:border-blue-300 focus:ring-1 focus:ring-blue-300"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                2
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <span className="font-semibold text-gray-900">AA</span>
                  <span className="text-gray-600">afaq ahmed</span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">My Dashboard</h1>
              <p className="text-gray-600">Manage your tasks and projects efficiently</p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <Button variant="outline" onClick={addDemoTasks} className="gap-2 bg-transparent">
                <FileText className="h-4 w-4" />
                Add Demo Tasks
              </Button>
              <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2 bg-blue-500 hover:bg-blue-600">
                <Plus className="h-4 w-4" />
                Create Task
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Filter by:</span>

              <Select value={filters.priority} onValueChange={(value) => handleFilterChange("priority", value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-priorities">All Priorities</SelectItem>
                  {uniquePriorities.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.assignee} onValueChange={(value) => handleFilterChange("assignee", value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-assignees">All Assignees</SelectItem>
                  {uniqueAssignees.map((assignee) => (
                    <SelectItem key={assignee} value={assignee}>
                      {assignee}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-status">All Status</SelectItem>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="ghost"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className={`text-sm px-2 ${
                  hasActiveFilters
                    ? "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    : "text-gray-400 cursor-not-allowed"
                }`}
              >
                Clear Filters
              </Button>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-500">Active filters:</span>
                  {filters.search && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      Search: "{filters.search}"
                    </span>
                  )}
                  {filters.priority !== "all-priorities" && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-800">
                      Priority: {filters.priority.charAt(0).toUpperCase() + filters.priority.slice(1)}
                    </span>
                  )}
                  {filters.assignee !== "all-assignees" && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      Assignee: {filters.assignee}
                    </span>
                  )}
                  {filters.status !== "all-status" && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                      Status:{" "}
                      {filters.status === "in_progress"
                        ? "In Progress"
                        : filters.status.charAt(0).toUpperCase() + filters.status.slice(1)}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Results Summary */}
          {hasActiveFilters && (
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Showing {filteredTasks.length} of {tasks.length} tasks
              </p>
            </div>
          )}

          {/* Kanban Board */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {columns.map((column) => {
                const columnTasks = getTasksByStatus(column.id)
                return (
                  <SortableContext
                    key={column.id}
                    items={columnTasks.map((task) => task.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <KanbanColumn id={column.id} title={column.title} count={columnTasks.length}>
                      {columnTasks.map((task) => (
                        <TaskCard key={task.id} task={task} onEdit={handleEditTask} onDelete={handleDeleteTask} />
                      ))}
                    </KanbanColumn>
                  </SortableContext>
                )
              })}
            </div>

            {createPortal(
              <DragOverlay>
                {activeTask && (
                  <TaskCard task={activeTask} isDragging onEdit={handleEditTask} onDelete={handleDeleteTask} />
                )}
              </DragOverlay>,
              document.body,
            )}
          </DndContext>

          {/* No Results Message */}
          {hasActiveFilters && filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-600 mb-4">
                No tasks match your current filters. Try adjusting your search criteria.
              </p>
              <Button onClick={clearFilters} variant="outline">
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTask={handleCreateTask}
      />

      {/* Edit Task Modal */}
      {editingTask && (
        <EditTaskModal
          isOpen={!!editingTask}
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onUpdateTask={handleUpdateTask}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingTask && (
        <DeleteTaskModal
          isOpen={!!deletingTask}
          task={deletingTask}
          onClose={() => setDeletingTask(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  )
}

export default KanbanBoard
