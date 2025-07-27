"use client";

import { useForm, Controller } from "react-hook-form";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useQuery } from "@tanstack/react-query";
import { CreateTaskPayload } from "@/types/index";
import { fetchUsers } from "@/api/tasks";
import { User } from "@/types/index";
import { toast } from "sonner";

interface TaskFormData {
  title: string;
  description: string;
  status: string;
  priority: string;
  assigneeId: string;
  due_date: string;
}
interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (task: CreateTaskPayload) => void;
  isSubmitting: boolean;
}

const CreateTaskModal = ({
  isOpen,
  onClose,
  onCreateTask,
}: CreateTaskModalProps) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    defaultValues: {
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      assigneeId: "",
      due_date: new Date(
        new Date().setDate(new Date().getDate() + 7)
      ).toISOString(),
    },
  });

  const {
    data: users = [],
    isLoading: isUsersLoading,
    isError: isUsersError,
  } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const watchedStatus = watch("status");
  const watchedPriority = watch("priority");

  const onSubmit = async (data: TaskFormData) => {
    onCreateTask({
      ...data,
      status: data.status as "todo" | "in_progress" | "done",
      priority: data.priority as "low" | "medium" | "high",
      due_date: data.due_date,
    });
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Create New Task
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="p-1"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Task Title *
            </label>
            <Input
              id="title"
              {...register("title", { required: "Task title is required" })}
              placeholder="Enter task title"
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Enter task description"
              rows={3}
              className="resize-none"
            />
          </div>

          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Status
            </label>
            <Select
              value={watchedStatus}
              onValueChange={(value) => setValue("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label
              htmlFor="priority"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Priority
            </label>
            <Select
              value={watchedPriority}
              onValueChange={(value) => setValue("priority", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isUsersLoading ? (
            <p className="text-sm text-gray-500 mt-1">Loading users...</p>
          ) : (
            <div>
              <label
                htmlFor="assigneeId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Assignee *
              </label>

              <Controller
                name="assigneeId"
                control={control}
                rules={{ required: "Assignee is required" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isUsersLoading ? "Loading..." : "Select user"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />

              {errors.assigneeId && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.assigneeId.message}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-500 hover:bg-blue-600"
            >
              {isSubmitting ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
