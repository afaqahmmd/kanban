"use client"

import { X, AlertTriangle } from "lucide-react"
import { Button } from "./ui/button"

import { Task } from "@/types/index"

interface DeleteTaskModalProps {
  isOpen: boolean
  task: Task
  onClose: () => void
  onConfirm: () => void
}

const DeleteTaskModal = ({ isOpen, task, onClose, onConfirm }: DeleteTaskModalProps) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Delete Task</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-1">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Are you sure you want to delete this task?</h3>
              <p className="text-sm text-gray-600">
                This action cannot be undone. The task "{task.title}" will be permanently removed.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Assignee: {task.assigneeId}</span>
              <span>Priority: {task.priority}</span>
              <span>Status: {task.status}</span>
              <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button type="button" onClick={onConfirm} className="flex-1 bg-red-500 hover:bg-red-600 text-white">
              Delete Task
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeleteTaskModal
