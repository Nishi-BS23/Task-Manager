import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
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
    const [page, setPage] = useState(1);
    const [pageSize] = useState(5);

    const debounceSearchTitle = useDebounce(searchTitle, 500);
    const { data, isLoading, isError } = useQuery<
        { tasks: Task[]; total: number },
        Error
    >({
        queryKey: ["tasks", debounceSearchTitle, page, pageSize],
        queryFn: () => getTasks(debounceSearchTitle, page, pageSize),
    });

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

    const openEditModal = (task: Task) => {
        setSelectedTask(task);
        setEditModalOpen(true);
    };

    const openDeleteModal = (task: Task) => {
        setSelectedTask(task);
        setDeleteModalOpen(true);
    };

    const columns: ColumnDef<Task>[] = [
        {
            accessorKey: "fullName",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Full Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div>{row.getValue("fullName")}</div>,
        },
        {
            accessorKey: "title",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Title
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div>{row.getValue("title")}</div>,
        },
        {
            accessorKey: "description",
            header: "Description",
            cell: ({ row }) => <div>{row.getValue("description")}</div>,
        },
        {
            id: "actions",
            header: "Actions",
            enableHiding: true,
            cell: ({ row }) => {
                const task = row.original;
                return (
                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(task)}
                        >
                            Edit
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openDeleteModal(task)}
                        >
                            Delete
                        </Button>
                    </div>
                );
            },
        },
    ];

    const table = useReactTable({
        data: tasks,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            pagination: {
                pageIndex: page - 1,
                pageSize,
            },
            columnFilters: [{ id: "title", value: debounceSearchTitle }],
        },
        manualPagination: true,
        pageCount: totalPages,
    });

    const confirmDelete = () => {
        if (selectedTask) deleteMutation.mutate(selectedTask.id);
    };

    if (isLoading) return <div className="text-center">Loading...</div>;
    if (isError) {
        toast.error("Failed to load tasks");
        return (
            <div className="text-center text-destructive">Something went wrong.</div>
        );
    }

    return (
        <div className="w-full p-7">
            <h1 className="text-2xl font-bold mb-4">Task List</h1>
            <div className="flex items-center py-4">
                <Input
                    placeholder="Search by title..."
                    value={searchTitle}
                    onChange={(e) => {
                        const input = e.target.value;
                        if (searchTitle === "" && input.startsWith(" ")) return;
                        setSearchTitle(input);
                    }}
                    className="max-w-sm"
                />
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No tasks found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        setPage((p) => Math.max(1, p - 1));
                        table.previousPage();
                    }}
                    disabled={page === 1}
                >
                    Previous
                </Button>
                <span>
                    Page {page} of {totalPages || 1}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        setPage((p) => Math.min(totalPages, p + 1));
                        table.nextPage();
                    }}
                    disabled={page === totalPages || totalPages === 0}
                >
                    Next
                </Button>
            </div>

            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Task</DialogTitle>
                    </DialogHeader>
                    {selectedTask && (
                        <TaskForm
                            initialData={{
                                fullName: selectedTask.fullName,
                                title: selectedTask.title,
                                description: selectedTask.description,
                            }}
                            taskId={selectedTask.id}
                            onClose={() => setEditModalOpen(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete Task</DialogTitle>
                    </DialogHeader>
                    <p className="mb-4">
                        Are you sure you want to delete the task:{" "}
                        <b>{selectedTask?.title}</b>?
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Yes, Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TaskList;
