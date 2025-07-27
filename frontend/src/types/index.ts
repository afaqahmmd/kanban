export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "in_progress" | "done";

type Assignee = {
  id: string;
  full_name: string;
  email: string;
};

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  assigneeId: string;
  assignee?: Assignee | null; // Optional, can be null if no assignee
  due_date: string; // ISO string from DateTime
  attachment_url?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  title: string;
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


export type CreateTaskPayload = {
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  assigneeId: string;
  due_date: string;
};

export interface UpdateTaskPayload {
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  assigneeId: string;
  due_date?: string;
}