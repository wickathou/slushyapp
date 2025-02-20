import { Router } from "express";
import * as controller from "../controllers/index";
import { authenticate } from "../middlewares/auth";

export const index = Router();

index.get("/", authenticate, controller.index);
index.post("/teams", authenticate, controller.createTeam);
index.post("/teams/:teamId/members", authenticate, controller.addMemberToTeam);
index.post("/teams/:teamId/todos", authenticate, controller.createTodo);
index.patch("/teams/:teamId/todos/:todoId/status", authenticate, controller.updateTodoStatus);
index.post("/teams/:teamId/notes", authenticate, controller.createNote);

