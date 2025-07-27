import {Request , Response, NextFunction} from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];

    if(!token) {
        return res.status(401).json({ error: "No token provided" });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
        req.user = { id: payload.userId };
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }

}