"use client"

import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "./ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"

import { Task } from "@/types/index"

interface TaskCardProps {
  task: Task
  isDragging?: boolean
  onEdit?: (task: Task) => void
  onDelete?: (task: Task) => void
}

const TaskCard = ({ task, isDragging = false, onEdit, onDelete }: TaskCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: task.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const getPriorityBadge = (priority: string) => {
    const baseClasses = "text-white text-xs font-medium px-2 py-1 rounded"
    switch (priority) {
      case "high":
        return <span className={`${baseClasses} bg-red-500`}>High</span>
      case "medium":
        return <span className={`${baseClasses} bg-amber-500`}>Medium</span>
      case "low":
        return <span className={`${baseClasses} bg-blue-500`}>Low</span>
      case "complete":
        return <span className={`${baseClasses} bg-green-500`}>✓ Complete</span>
      default:
        return <span className={`${baseClasses} bg-gray-500`}>Unknown</span>
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white border border-gray-200 rounded-lg p-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-3">
        {getPriorityBadge(task.priority)}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit?.(task)} className="gap-2">
              <Edit className="h-4 w-4" />
              Edit Task
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete?.(task)} className="gap-2 text-red-600">
              <Trash2 className="h-4 w-4" />
              Delete Task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>
      <p className="text-sm text-gray-600 mb-4">{task.description}</p>
      <div className="flex items-center text-xs text-gray-500">
        <div className="h-5 w-5 mr-2 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium">
          {task.assigneeId.toUpperCase()}
        </div>
        <span>{task.assigneeId}</span>
      </div>
    </div>
  )
}

export default TaskCard
