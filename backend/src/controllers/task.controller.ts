import { Request, Response } from "express";
import prisma from "../utils/prisma";

// GET /api/tasks
export const getTasks = async (req: Request, res: Response) => {
  const { status, priority, assigneeId } = req.query;

  const tasks = await prisma.task.findMany({
    where: {
      status: status ? String(status) : undefined,
      priority: priority ? String(priority) : undefined,
      assigneeId: assigneeId ? String(assigneeId) : undefined,
    },
    orderBy: { createdAt: "desc" },
    include: { assignee: true }, // To get user info too
  });

  res.json(tasks);
};

// POST /api/tasks
export const createTask = async (req: Request, res: Response) => {
  const { title, description, status, priority, assigneeId, due_date } =
    req.body;
  if (new Date(due_date) <= new Date()) {
    return res.status(400).json({ error: "Due date must be in future" });
  }

  const task = await prisma.task.create({
    data: {
      title,
      description,
      status,
      priority,
      assigneeId,
      due_date: new Date(due_date),
    },
  });
  res.status(201).json(task);
};


//PUT /api/tasks/:id
export const updateTask = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, status, priority, assigneeId, due_date } = req.body;

  const task = await prisma.task.update({
    where: { id },
    data: {
      title,
      description,
      status,
      priority,
      assigneeId,
      due_date: due_date ? new Date(due_date) : undefined,
    },
  });

  res.json(task);
};

// DELETE /api/tasks/:id
export const deleteTask = async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.task.delete({ where: { id } });
  res.status(204).send();
};