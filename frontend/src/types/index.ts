export type TaskPriority = "low" | "medium" | "high"
export type TaskStatus = "todo" | "in_progress" | "done"

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
  dueDate: string;
  attachmentUrl?: string;
}
export interface Column {
  id: string
  title: string
}


export interface User {
  id: string;
  email: string;
  full_name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  full_name: string;
  password: string;
}


export interface Filters {
  priority: "all-priorities" | TaskPriority;
  assignee: string;
  status: "all-status" | TaskStatus;
  search: string;
}