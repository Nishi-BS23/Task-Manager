import { api } from "../lib/api";
import type { Task } from "../types/Task";

// Get all tasks
export const getTasks = async (): Promise<Task[]> => {
  const res = await api.get("/tasks");
  return res.data;
};

// Create a task
export const createTask = async (task: Task): Promise<Task> => {
  const res = await api.post("/tasks", task);
  return res.data;
};

// Update a task
export const updateTask = async (taskId: number, task: Task): Promise<Task> => {
  const res = await api.put(`/tasks/${taskId}`, task);
  return res.data;
};

// Delete a task
export const deleteTask = async (taskId: number): Promise<void> => {
  await api.delete(`/tasks/${taskId}`);
};
