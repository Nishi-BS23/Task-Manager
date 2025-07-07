import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import type { Task } from "../types/Task";

const TaskList = () => {
    const queryClient = useQueryClient();

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const BASE_URL = "http://localhost:3001";
    const getTaks = async () => {
        const reponse = await axios.get(`${BASE_URL}/tasks`);
        return reponse.data;
    };
    const deleteTask = async (id: number) => {
        return await axios.delete(`${BASE_URL}/tasks/${id}`)
    }
    const {
        data: tasks,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["tasks"],
        queryFn: getTaks,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteTask,
        onSuccess: () => {
            toast.success("Task deleted");
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            setDeleteModalOpen(false);
        },
        onError: () => toast.error("Delete failed"),
    });
    const openDeleteModal = (task: Task) => {
        setSelectedTask(task);
        setDeleteModalOpen(true);
    }
    const confirmDelete = () => {
        if (selectedTask) deleteMutation.mutate(selectedTask.id);
    }
    if (isLoading) return <p className="text-center">Loading...</p>;
    if (isError) {
        toast.error("Failed to load tasks");
        return <p className="text-center text-red-500">Something went wrong.</p>;
    }
    return (
        <div className="bg-gray-300 m-7">
            <h1 className="text-2xl">Task List</h1>
            {tasks.length === 0 ? (
                <p className="text-center">No tasks found.</p>
            ) : (
                <table className="w-full">
                    <thead className="bg-amber-100">
                        <tr>
                            <th className="p-3">Full Name</th>
                            <th className="p-3">Title</th>
                            <th className="p-3">Descrption</th>
                            <th className="p-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            tasks.map((task: Task) => (
                                <tr key={task.id}>
                                    <td className="px-4 py-2 border-b">
                                        {task.fullName}
                                    </td>
                                    <td className="px-4 py-2 border-b">
                                        {task.title}
                                    </td>
                                    <td className="px-4 py-2 border-b">
                                        {task.description}
                                    </td>
                                    <td className="px-4 py-2 border-b">
                                        <button className="text-blue-600 hover:underline hover:cursor-pointer px-1 rounded">
                                            Edit
                                        </button>
                                        <button onClick={() => openDeleteModal(task)}
                                            className="text-red-600 hover:underline hover:cursor-pointer px-1 rounded">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            )}
            {deleteModalOpen && selectedTask && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl text-center">
                        <h2 className="text-xl font-semibold mb-4">Delete Task</h2>
                        <p className="mb-4">Are you sure you want to delete the task: <b>{selectedTask.title}</b>?</p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={() => setDeleteModalOpen(false)}
                                className="px-4 py-2 bg-gray-300 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskList;
