import dotenv from "dotenv";
import express from "express";
import logger from "morgan";
import * as path from "path";
dotenv.config();

import { errorHandler, errorNotFoundHandler } from "./middlewares/errorHandler";

import db from "./db";
// Routes
import { index } from "./routes/index";
import { auth } from "./routes/auth";
// Create Express server
export const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express configuration
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "pug");

app.use(logger("dev"));

app.use(express.static(path.join(__dirname, "../public")));
app.use("/api", index);
app.use("/auth", auth);

//TESTING ONLY DELETE LATER
app.get("/db", async (req, res) => {
    try {
        const users = await db.query("SELECT id, firstname  FROM users");
        const teams = await db.query("SELECT * FROM teams");
        const roles = await db.query("SELECT * FROM roles");
        const member_statuses = await db.query("SELECT * FROM member_statuses");
        const todo_statuses = await db.query("SELECT * FROM todo_statuses");
        const todos = await db.query("SELECT * FROM todos");
        const team_members = await db.query("SELECT * FROM team_members");
        const notes = await db.query("SELECT * FROM notes");
        const todo_assignments = await db.query(
            "SELECT * FROM todo_assignments",
        );
        const note_reactions = await db.query("SELECT * FROM note_reactions");
        const note_mentions = await db.query("SELECT * FROM note_mentions");
        const reactions = await db.query("SELECT * FROM reactions");
        const locations = await db.query("SELECT * FROM locations");
        res.json({
            users: users.rows,
            teams: teams.rows,
            roles: roles.rows,
            member_statuses: member_statuses.rows,
            todo_assignments: todo_assignments.rows,
            todo_statuses: todo_statuses.rows,
            todos: todos.rows,
            team_members: team_members.rows,
            notes: notes.rows,
            note_reactions: note_reactions.rows,
            note_mentions: note_mentions.rows,
            reactions: reactions.rows,
            locations: locations.rows,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

app.use(errorNotFoundHandler);
app.use(errorHandler);
