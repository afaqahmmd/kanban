// src/api/tasks.ts
import { Task } from '../types';

export const fetchTasks = async (): Promise<Task[]> => {
  const token = localStorage.getItem('token');

  const res = await fetch('/api/tasks', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch tasks');
  }

  return res.json();
};
