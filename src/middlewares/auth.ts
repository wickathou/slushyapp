import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth";

export interface AuthRequest extends Request {
    userId?: number;
}

export const authenticate = (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).send("Authentication required");
    }

    try {
        const decoded = verifyToken(token) as { userId: number };
        req.userId = decoded.userId;
        next();
    } catch (err) {
        res.status(401).send("Invalid token");
    }
};
