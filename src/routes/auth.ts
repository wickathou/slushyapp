import express from "express";
import db from "../db";
import { hashPassword, comparePassword, generateToken } from "../utils/auth";
import { authenticate } from "../middlewares/auth";
import { Router } from "express";
import { Request,Response } from "express";
import { AuthRequest } from "../middlewares/auth";

export const auth = Router();

auth.get("/test", (req, res) => {
    res.json({ title: "What you want??" });
});

auth.post("/register", async (req:Request, res:Response) => {
    try {
        const { firstname, lastname, email, password } = req.body;
        const hashedPassword = await hashPassword(password);
        const { rows } = await db.query(
            "INSERT INTO users (firstname, lastname, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING id",
            [firstname, lastname, email, hashedPassword],
        );

        const token = generateToken(rows[0].id);
        res.status(201).json({ token });
    } catch (err) {
        res.status(400).json({ error: "Registration failed" });
    }
});

auth.post("/login", async (req:Request, res:Response) => {
    try {
        const { email, password } = req.body;
        const { rows } = await db.query(
            "SELECT * FROM users WHERE email = $1",
            [email],
        );
        const user = rows[0];

        if (!user || !(await comparePassword(password, user.password_hash))) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = generateToken(user.id);
        res.json({ token });
    } catch (err) {
        res.status(400).json({ error: "Login failed" });
    }
});

//TEST ROUTE DEV ONLY
auth.get("/me", authenticate, async (req:AuthRequest, res:Response) => {
    console.log("REQUEST FROM ME");
    console.log(req);
    try {
        // if (!req?.userId) throw new Error("no user Id");
        const { rows } = await db.query(
            "SELECT id, firstname, lastname, email FROM users WHERE id = $1",
            [req?.userId],
        );
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// export default router;
