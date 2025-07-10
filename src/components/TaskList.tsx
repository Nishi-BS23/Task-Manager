import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { deleteTask, getTasks } from "../api/tasks";
import { useDebounce } from "../hooks/useDebounce";
import type { Task } from "../types/Task";
import TaskForm from "./TaskForm";

const TaskList = () => {
    const queryClient = useQueryClient();

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [searchTitle, setSearchTitle] = useState("");
    // Pagination state
    const [page, setPage] = useState(1);
    const [pageSize] = useState(5);

    const debounceSearchTitle = useDebounce(searchTitle, 500);
    const {
        data,
        isLoading,
        isError,
    } = useQuery<{ tasks: Task[]; total: number }, Error>({
        queryKey: ["tasks", debounceSearchTitle, page, pageSize],
        queryFn: () => getTasks(debounceSearchTitle, page, pageSize),
    });
    console.log(data)
    // tasks and total count from API
    const tasks = data?.tasks ?? [];
    const total = data?.total ?? 0;
    const totalPages = Math.ceil(total / pageSize);

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
    const openEditModal = (task: Task) => {
        setSelectedTask(task);
        setEditModalOpen(true);
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
            <div className="m-3 flex items-center">
                <input
                    type="text"
                    value={searchTitle}
                    className="border rounded px-3 bg-gray-100"
                    placeholder="Search by title"
                    onChange={(e) => {
                        const input = e.target.value;
                        if (searchTitle === '' && input.startsWith(' ')) {
                            return;
                        }
                        setSearchTitle(input);
                    }}
                />
            </div>
            {tasks?.length === 0 ? (
                <p className="text-center">No tasks found.</p>
            ) : (
                <>
                    <table className="w-full">
                        <thead className="bg-amber-100">
                            <tr>
                                <th className="p-3">Full Name</th>
                                <th className="p-3">Title</th>
                                <th className="p-3">Descrption</th>
                                <th className="p-3">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-200">
                            {
                                tasks?.map((task: Task) => (
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
                                            <button onClick={() => openEditModal(task)} className="text-blue-600 hover:underline hover:cursor-pointer px-1 rounded">
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
                    {/* Pagination Controls */}
                    <div className="flex justify-center items-center mt-4 space-x-2">
                        <button
                            className="px-3 py-1 bg-gray-400 rounded disabled:opacity-50"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            Previous
                        </button>
                        <span>Page {page} of {totalPages || 1}</span>
                        <button
                            className="px-3 py-1 bg-gray-400 rounded disabled:opacity-50"
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || totalPages === 0}
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
            {editModalOpen && selectedTask && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-xl">
                        <h2 className="text-xl font-bold mb-4">Edit Task</h2>
                        <TaskForm
                            initialData={{
                                fullName: selectedTask.fullName,
                                title: selectedTask.title,
                                description: selectedTask.description,
                            }}
                            taskId={selectedTask.id}
                            onClose={() => setEditModalOpen(false)}
                        />
                    </div>
                </div>
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
