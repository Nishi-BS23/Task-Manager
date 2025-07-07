import { yupResolver } from "@hookform/resolvers/yup"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { schema } from "../types/Schema"
import type { Task } from "../types/Task"

const TaskForm = () => {
    const BASE_URL = "http://localhost:3001";
    const queryClient = useQueryClient();
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<Omit<Task, "id">>({
        resolver: yupResolver(schema),
    })
    const addTask = async (data: Task) => {
        const response = await axios.post(`${BASE_URL}/tasks`, data);
        return response.data;
    }
    const { mutate } = useMutation({
        mutationFn: addTask,
        onSuccess: () => {
            toast.success("Task added successfully!", {
                duration: 8000,
            });
            reset();
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
        onError: (error) => {
            console.error("Error creating task: ", error);
        }
    })
    const onSubmit = (data: Omit<Task, "id">) => {
        const finalData: Task = {
            id: Date.now(),
            ...data
        }
        mutate(finalData);
    }
    return (
        <div className="flex items-center justify-center p-4">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="bg-gray-200 space-y-4 max-w-xl w-full p-4 rounded"
            >
                {/* Full Name */}
                <div className="w-full">
                    <div className="flex items-center space-x-4">
                        <label htmlFor="fullName" className="min-w-[120px] text-right">
                            Full Name
                        </label>
                        <input
                            type="text"
                            {...register("fullName")}
                            className="border rounded w-full px-3 py-2"
                        />
                    </div>
                    {errors.fullName && (
                        <p className="text-sm text-red-500 mt-1 ml-[128px]">
                            {errors.fullName.message}
                        </p>
                    )}
                </div>

                {/* Title */}
                <div className="w-full">
                    <div className="flex items-center space-x-4">
                        <label htmlFor="title" className="min-w-[120px] text-right">
                            Title
                        </label>
                        <input
                            type="text"
                            {...register("title")}
                            className="border rounded w-full px-3 py-2"
                        />
                    </div>
                    {errors.title && (
                        <p className="text-sm text-red-500 mt-1 ml-[128px]">
                            {errors.title.message}
                        </p>
                    )}
                </div>

                {/* Description */}
                <div className="w-full">
                    <div className="flex items-center space-x-4">
                        <label htmlFor="description" className="min-w-[120px] text-right">
                            Description
                        </label>
                        <input
                            type="text"
                            {...register("description")}
                            className="border rounded w-full px-3 py-2"
                        />
                    </div>
                    {errors.description && (
                        <p className="text-sm text-red-500 mt-1 ml-[128px]">
                            {errors.description.message}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    className="border rounded bg-green-500 text-white px-4 py-2 hover:bg-green-600 transition"
                >
                    Submit
                </button>
            </form>
        </div>

    )
}

export default TaskForm

