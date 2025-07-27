"use client"

import { useForm } from "react-hook-form"
import { X } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

interface Task {
  id: string
  title: string
  description: string
  status: string
  priority: string
  assignee: string
}

interface EditTaskModalProps {
  isOpen: boolean
  task: Task
  onClose: () => void
  onUpdateTask: (task: Omit<Task, "id">) => void
}

interface TaskFormData {
  title: string
  description: string
  status: string
  priority: string
  assignee: string
}

const EditTaskModal = ({ isOpen, task, onClose, onUpdateTask }: EditTaskModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    defaultValues: {
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority === "complete" ? "high" : task.priority,
      assignee: task.assignee,
    },
  })

  const watchedStatus = watch("status")
  const watchedPriority = watch("priority")

  const onSubmit = async (data: TaskFormData) => {
    try {
      onUpdateTask(data)
      reset()
      onClose()
    } catch (error) {
      console.error("Error updating task:", error)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Edit Task</h2>
          <Button variant="ghost" size="sm" onClick={handleClose} className="p-1">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Task Title *
            </label>
            <Input
              id="title"
              {...register("title", { required: "Task title is required" })}
              placeholder="Enter task title"
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Enter task description"
              rows={3}
              className="resize-none"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <Select value={watchedStatus} onValueChange={(value) => setValue("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <Select value={watchedPriority} onValueChange={(value) => setValue("priority", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 mb-1">
              Assignee *
            </label>
            <Input
              id="assignee"
              {...register("assignee", { required: "Assignee is required" })}
              placeholder="Enter assignee name"
              className={errors.assignee ? "border-red-500" : ""}
            />
            {errors.assignee && <p className="text-red-500 text-xs mt-1">{errors.assignee.message}</p>}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-500 hover:bg-blue-600">
              {isSubmitting ? "Updating..." : "Update Task"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditTaskModal
