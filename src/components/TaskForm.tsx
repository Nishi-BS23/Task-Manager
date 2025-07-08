import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { schema } from "../types/Schema";
import type { Task } from "../types/Task";

interface TaskFormProps {
    initialData?: Omit<Task, "id">;
    taskId?: number;
    onClose?: () => void;
}

const TaskForm = ({ initialData, taskId, onClose }: TaskFormProps) => {
    const BASE_URL = "http://localhost:3001";
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<Omit<Task, "id">>({
        resolver: yupResolver(schema),
        defaultValues: initialData || {
            fullName: "",
            title: "",
            description: "",
        },
    });

    useEffect(() => {
        if (initialData) reset(initialData);
    }, [initialData, reset]);

    const mutationFn = async (data: Task) => {
        if (taskId) {
            return await axios.put(`${BASE_URL}/tasks/${taskId}`, data);
        } else {
            return await axios.post(`${BASE_URL}/tasks`, data);
        }
    };

    const { mutate } = useMutation({
        mutationFn,
        onSuccess: () => {
            toast.success(taskId ? "Task updated!" : "Task added!");
            reset();
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            if (onClose) onClose();
        },
        onError: (err) => {
            console.error("Form error:", err);
            toast.error("Something went wrong");
        },
    });

    const onSubmit = (data: Omit<Task, "id">) => {
        const finalData: Task = {
            id: taskId ?? Date.now(),
            ...data,
        };
        mutate(finalData);
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 bg-gray-200 p-4 rounded w-full max-w-xl mx-auto"
        >
            {/* Full Name */}
            <div>
                <label className="block mb-1">Full Name</label>
                <input {...register("fullName")} className="border w-full p-2 rounded bg-white" />
                {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}
            </div>

            {/* Title */}
            <div>
                <label className="block mb-1">Title</label>
                <input {...register("title")} className="border w-full p-2 rounded bg-white" />
                {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
            </div>

            {/* Description */}
            <div>
                <label className="block mb-1">Description</label>
                <textarea {...register("description")} className="border w-full p-2 rounded bg-white" />
                {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
            </div>

            <div className="flex justify-end space-x-2">
                {taskId && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                    {taskId ? "Update" : "Submit"}
                </button>
            </div>

        </form>
    );
};

export default TaskForm;


