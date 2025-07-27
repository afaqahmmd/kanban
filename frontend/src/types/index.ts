export type TaskPriority = "low" | "medium" | "high" | "complete"

export interface Task {
  id: string
  title: string
  description: string
  status: string
  priority: string
  assignee: string
}

export interface Column {
  id: string
  title: string
}
