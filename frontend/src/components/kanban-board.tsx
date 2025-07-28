"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Bell, Plus, ChevronDown } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTaskApi, deleteTaskApi, updateTaskApi } from "@/api/tasks";
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
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import KanbanColumn from "./kanban-column";
import TaskCard from "./task-card";
import CreateTaskModal from "./create-task-modal";
import EditTaskModal from "./edit-task-modal";
import DeleteTaskModal from "./delete-task-modal";
import { logout } from "@/redux/slices/userSlice";
import { Task, Column, Filters, UpdateTaskPayload } from "@/types/index";
import { useQuery } from "@tanstack/react-query";
import { getTasks } from "@/api/tasks";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../redux/store";

type UpdateTaskInput = {
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  assigneeId: string;
  due_date?: string;
};

const KanbanBoard = () => {
  const queryClient = useQueryClient();
  const [tasks, setTasks] = useState<Task[]>([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector(
    (state: RootState) => state.users.currentUser
  );

  // Current logged in User

  useEffect(() => {
    console.log("Current User:", currentUser);
  }, [currentUser]);

  // GET tasks list
  const {
    data: tasksList,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["tasks"], // can include filters like ['tasks', { status: 'todo' }]
    queryFn: () => getTasks(), // you can pass filters here
  });

  // CREATE new task
  const { mutate: createTask, isPending: isCreatingTask } = useMutation({
    mutationFn: createTaskApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create task" + (error as Error).message);
    },
  });

  useEffect(() => {
    if (tasksList) {
      console.log("tasks list fetched");
      setTasks(tasksList);
    }
  }, [tasksList]);

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    priority: "all-priorities",
    assignee: "all-assignees",
    status: "all-status",
    search: "",
  });

  // DELETE task mutation
  const { mutate: deleteTask } = useMutation({
    mutationFn: deleteTaskApi,
    onSuccess: () => {
      toast.success("Task deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setDeletingTask(null);
    },
    onError: (error: Error) => {
      toast.error("Failed to delete task: " + error.message);
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskPayload }) =>
      updateTaskApi(id, data),
    onSuccess: () => {
      toast.success("Task updated successfully");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setEditingTask(null);
    },
    onError: (error: Error) => {
      toast.error("Failed to update task: " + error.message);
    },
  });

  // Function to pass down to EditTaskModal
  const handleUpdateTask = (updatedTaskData: UpdateTaskInput) => {
    if (!editingTask) return;
    updateTaskMutation.mutate({ id: editingTask.id, data: updatedTaskData });
  };
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  const columns: Column[] = [
    { id: "todo", title: "To Do" },
    { id: "in_progress", title: "In Progress" },
    { id: "done", title: "Done" },
  ];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  // Get unique assignees and priorities from tasks
  const uniqueAssignees = useMemo(() => {
    const assignees = [
      ...new Set(tasks.map((task) => task.assignee?.full_name)),
    ].sort();
    return assignees;
  }, [tasks]);

  const uniquePriorities = useMemo(() => {
    const priorities = [...new Set(tasks.map((task) => task.priority))];
    return priorities.sort();
  }, [tasks]);

  // Filter tasks based on current filters
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          task.title.toLowerCase().includes(searchLower) ||
          (task.description?.toLowerCase() || "").includes(searchLower) ||
          task.assigneeId.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Priority filter
      if (
        filters.priority !== "all-priorities" &&
        task.priority !== filters.priority
      ) {
        return false;
      }

      // Assignee filter
      if (
        filters.assignee !== "all-assignees" &&
        task.assignee?.full_name !== filters.assignee
      ) {
        return false;
      }

      // Status filter
      if (filters.status !== "all-status" && task.status !== filters.status) {
        return false;
      }

      return true;
    });
  }, [tasks, filters]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find((task) => task.id === activeId);
    if (!activeTask) return;

    // Check if we're over a column and it's different from current status
    if (
      columns.some((col) => col.id === overId) &&
      activeTask.status !== overId
    ) {
      setTasks((tasks) =>
        tasks.map((task) =>
          task.id === activeId
            ? {
                ...task,
                status: overId as "todo" | "in_progress" | "done",
                priority: task.priority,
              }
            : task
        )
      );
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // If dropping on the same item, do nothing
    if (activeId === overId) return;

    const activeTask = tasks.find((task) => task.id === activeId);
    if (!activeTask) return;

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
            : task
        )
      );
    }
    // Handle dropping on another task (reorder within column or move to different column)
    else {
      const overTask = tasks.find((task) => task.id === overId);
      if (overTask) {
        setTasks((prevTasks) => {
          const activeIndex = prevTasks.findIndex(
            (task) => task.id === activeId
          );
          const overIndex = prevTasks.findIndex((task) => task.id === overId);

          // If same column, reorder (status stays the same)
          if (activeTask.status === overTask.status) {
            const newTasks = [...prevTasks];
            // Remove the active task
            const [movedTask] = newTasks.splice(activeIndex, 1);
            // Insert at the new position
            newTasks.splice(overIndex, 0, movedTask);
            return newTasks;
          } else {
            // Different column - move to target column and update status
            const newTasks = [...prevTasks];
            const updatedActiveTask = {
              ...activeTask,
              status: overTask.status, // Update status to match target column
            };

            // Remove from current position
            newTasks.splice(activeIndex, 1);
            // Insert at target position
            newTasks.splice(overIndex, 0, updatedActiveTask);
            return newTasks;
          }
        });
      }
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };

  const handleDeleteTask = (task: Task) => {
    setDeletingTask(task);
  };

  // Confirm delete handler
  const handleConfirmDelete = () => {
    if (!deletingTask) return;
    deleteTask(deletingTask.id);
  };

  const getTasksByStatus = (status: string) => {
    return filteredTasks
      .filter((task) => task.status === status)
      .sort((a, b) => {
        // Maintain the original order from the tasks array
        const aIndex = tasks.findIndex((task) => task.id === a.id);
        const bIndex = tasks.findIndex((task) => task.id === b.id);
        return aIndex - bIndex;
      });
  };

  const handleFilterChange = (filterType: keyof Filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      priority: "all-priorities",
      assignee: "all-assignees",
      status: "all-status",
      search: "",
    });
  };

  const hasActiveFilters =
    filters.priority !== "all-priorities" ||
    filters.assignee !== "all-assignees" ||
    filters.status !== "all-status" ||
    filters.search !== "";

  if (isLoading) {
    return <div className="p-6 text-gray-600">Loading tasks...</div>;
  }

  if (isError) {
    return <div className="p-6 text-red-600">Failed to load tasks.</div>;
  }

  const handleLogout = () => {
    dispatch(logout());
    queryClient.clear();
    setTasks([]);
    navigate("/login");
    toast.success("Logged out successfully");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center text-blue-500 font-bold text-xl">
            <svg
              className="w-6 h-6 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  {currentUser && currentUser.full_name.length>0 && (
                    <>
                      <span className="font-semibold text-gray-900">
                        {currentUser?.full_name.slice(0, 2).toUpperCase()}
                      </span>
                      <span className="text-gray-600 hidden md:block">
                        {currentUser?.full_name}
                      </span>
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                My Dashboard
              </h1>
              <p className="text-gray-600">
                Manage your tasks and projects efficiently
              </p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="gap-2 bg-blue-500 hover:bg-blue-600"
              >
                <Plus className="h-4 w-4" />
                Create Task
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                Filter by:
              </span>

              <Select
                value={filters.priority}
                onValueChange={(value) => handleFilterChange("priority", value)}
              >
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

              <Select
                value={filters.assignee}
                onValueChange={(value) => handleFilterChange("assignee", value)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-assignees">All Assignees</SelectItem>
                  {uniqueAssignees.map((assignee) => (
                    <SelectItem key={assignee} value={assignee as string}>
                      {assignee}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange("status", value)}
              >
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
                      Priority:{" "}
                      {filters.priority.charAt(0).toUpperCase() +
                        filters.priority.slice(1)}
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
                        : filters.status.charAt(0).toUpperCase() +
                          filters.status.slice(1)}
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
                const columnTasks = getTasksByStatus(column.id);
                return (
                  <SortableContext
                    key={column.id}
                    items={columnTasks.map((task) => task.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <KanbanColumn
                      id={column.id}
                      title={column.title}
                      count={columnTasks.length}
                    >
                      {columnTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onEdit={handleEditTask}
                          onDelete={handleDeleteTask}
                        />
                      ))}
                    </KanbanColumn>
                  </SortableContext>
                );
              })}
            </div>

            {createPortal(
              <DragOverlay>
                {activeTask && (
                  <TaskCard
                    task={activeTask}
                    isDragging
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                  />
                )}
              </DragOverlay>,
              document.body
            )}
          </DndContext>

          {/* No Results Message */}
          {hasActiveFilters && filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tasks found
              </h3>
              <p className="text-gray-600 mb-4">
                No tasks match your current filters. Try adjusting your search
                criteria.
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
        onCreateTask={createTask}
        isSubmitting={isCreatingTask}
      />

      {/* Edit Task Modal */}
      {editingTask && (
        <EditTaskModal
          isOpen={!!editingTask}
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onUpdateTask={handleUpdateTask}
          isSubmitting={updateTaskMutation.isPending} // Optional: pass isLoading to disable submit
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
  );
};

export default KanbanBoard;
