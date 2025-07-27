import type { ReactNode } from "react"
import { useDroppable } from "@dnd-kit/core"

interface KanbanColumnProps {
  id: string
  title: string
  count: number
  children: ReactNode
}

const KanbanColumn = ({ id, title, count, children }: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ id })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "todo":
        return <div className="w-2 h-2 rounded-full bg-gray-400" />
      case "in-progress":
        return <div className="w-2 h-2 rounded-full bg-amber-400" />
      case "done":
        return <div className="w-2 h-2 rounded-full bg-green-500" />
      default:
        return <div className="w-2 h-2 rounded-full bg-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo":
        return "text-gray-500"
      case "in-progress":
        return "text-amber-500"
      case "done":
        return "text-green-500"
      default:
        return "text-gray-500"
    }
  }

  return (
    <div
      ref={setNodeRef}
      className={`bg-white border border-gray-200 rounded-lg flex flex-col shadow-sm transition-colors ${
        isOver ? "bg-blue-50 border-blue-300" : ""
      }`}
    >
      <div className="p-4 border-b border-gray-100 flex items-center gap-3">
        {getStatusIcon(id)}
        <h3 className={`font-medium ${getStatusColor(id)}`}>{title}</h3>
        <span className="ml-auto bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">{count}</span>
      </div>
      <div className="p-3 flex-1 space-y-3 min-h-[400px]">
        {children || <div className="text-center text-gray-400 py-8 text-sm">No tasks</div>}
      </div>
    </div>
  )
}

export default KanbanColumn
