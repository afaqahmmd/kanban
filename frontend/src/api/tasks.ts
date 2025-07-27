import { api } from "./api"; // adjust path as needed
import { Task } from "@/types/index";

interface CreateTaskPayload {
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  assigneeId: string;
  due_date: string;
}

export interface GetTasksParams {
  status?: string;
  priority?: string;
  assigneeId?: string;
}


export const fetchUsers = async () => {
  const res = await api.get("/users");
  return res.data;
};

export const getTasks = async (params?: GetTasksParams) => {
  const response = await api.get("/tasks", { params });
  return response.data;
};

export const createTaskApi = async (
  taskData: CreateTaskPayload
): Promise<Task> => {
  const response = await api.post("/tasks", taskData);
  return response.data;
};

export const deleteTaskApi = async (taskId: string): Promise<void> => {
  const response = await api.delete(`/tasks/${taskId}`);
  if (response.status !== 204) {
    throw new Error("Failed to delete task");
  }
};

type UpdateTaskInput = {
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  assigneeId: string;
  due_date?: string;
};

// id is needed for URL param, data is task data to update
export const updateTaskApi = async (id: string, data: UpdateTaskInput): Promise<Task> => {
  const response = await api.put(`/tasks/${id}`, data);
  return response.data;
};