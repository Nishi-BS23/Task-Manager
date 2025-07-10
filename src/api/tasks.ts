import { api } from "../lib/api";
import type { Task } from "../types/Task";

// Get all tasks
export const getTasks = async (
  searchTitle?: string,
  page: number = 1,
  pageSize: number = 5
): Promise<{ tasks: Task[]; total: number }> => {
  const params: any = {
    _page: page,
    _limit: pageSize,
  };
  if (searchTitle?.trim()) {
    params.title_like = searchTitle.trim();
  }
  const res = await api.get("/tasks");
  console.log("Headers:", res);
  const total = res.data.length;
  return { tasks: res.data, total };
};

// Create a task
export const createTask = async (task: Task): Promise<Task> => {
  const res = await api.post("/tasks", task);
  return res.data;
};

// Update a task
export const updateTask = async (taskId: string, task: Task): Promise<Task> => {
  const res = await api.put(`/tasks/${taskId}`, task);
  return res.data;
};

// Delete a task
export const deleteTask = async (taskId: string): Promise<void> => {
  await api.delete(`/tasks/${taskId}`);
};
