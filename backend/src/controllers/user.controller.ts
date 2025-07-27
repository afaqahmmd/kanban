import { Request, Response } from "express";
import prisma from "../utils/prisma";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        full_name: true,
      },
    });
    return res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      error: "Error fetching users",
    });
  }
};

export const searchUsers = async (req: Request, res: Response) => {
  const q = req.query.q as string;
  if (!q) {
    return res.status(400).json({ error: "Query parameter 'q' is required" });
  }
  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: q, mode: "insensitive" } },
          { full_name: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, email: true, full_name: true },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to search users" });
  }
};
