import { Request, Response } from "express";
import db from "../db";
import { AuthRequest } from "../middlewares/auth";

/**
 * GET /
 * Home page.
 */
export const index = async (req: Request, res: Response): Promise<void> => {
    res.render("index", { title: "This is the api, you should not be here" });
};

//TODO create enums for roleId and memberStatusId
//TODO add default values on a different source to avoid repeating it

// Team Controller
export const createTeam = async (
    req: AuthRequest,
    res: Response,
): Promise<void> => {
    try {
        const { name } = req.body;
        //Default values for team member creation
        const roleId = 3;
        const memberStatusId = 2;
        await db.query("BEGIN");

        const team = await db.query(
            "INSERT INTO teams (name, creator_id) VALUES ($1, $2) RETURNING *",
            [name, req.userId],
        );

        const teamMember = await db.query(
            "INSERT INTO team_members (team_id, user_id, role_id, member_status_id) VALUES ($1,$2,$3,$4) RETURNING *",
            [team.rows[0].id, req.userId, roleId, memberStatusId],
        );
        await db.query("COMMIT");
        res.status(201).json({
            team: team.rows[0],
            teamMember: teamMember.rows[0],
        });
    } catch (err) {
        await db.query("ROLLBACK");
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

const isTeamMember = async (
    teamId: number | string,
    userId: number | string,
): Promise<boolean> => {
    const isTeamMemberQuery = await db.query(
        `SELECT FROM team_members where team_id = ${teamId} AND user_id = ${userId}`,
    );
    if (isTeamMemberQuery?.rows[0]) {
        return true;
    } else {
        return false;
    }
};

export const addMemberToTeam = async (
    req: AuthRequest,
    res: Response,
): Promise<void> => {
    try {
        const { teamId } = req.params;
        const { userIdToAdd } = req.body;
        console.log("FROM addMemberToTeam");
        console.log({ teamId, userIdToAdd, userId: req.userId });
        //Default values for team member creation
        const role_id = 2;
        const member_status_id = 1;

        const isTeamOwner = await db.query(
            `SELECT FROM teams where id = ${teamId} AND creator_id = ${req.userId}`,
        );
        if (isTeamOwner?.rows[0]) {
            // const isTeamMember = await db.query(
            //     `SELECT FROM team_members where team_id = ${teamId} AND user_id = ${userIdToAdd}`,
            // );
            if (isTeamMember(teamId, userIdToAdd)) {
                throw new Error("User id cannot be added or does not exist");
            }

            await db.query("BEGIN");

            const teamMember = await db.query(
                "INSERT INTO team_members (team_id, user_id, role_id, member_status_id) VALUES ($1,$2,$3,$4) RETURNING *",
                [teamId, userIdToAdd, role_id, member_status_id],
            );
            await db.query("COMMIT");
            res.status(201).json({
                teamMember: teamMember.rows[0],
            });
        } else {
            throw new Error("Team does not exist or user is not the creator");
        }
    } catch (err) {
        await db.query("ROLLBACK");
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

const getUserTeamMemberId = async (
    teamId: number | string,
    userId: number | string,
): Promise<number | null> => {
    const UserTeamMemberQuery = await db.query(
        `SELECT id FROM team_members WHERE user_id = ${userId} AND team_id = ${teamId}`,
    );
    if (UserTeamMemberQuery?.rows[0]) {
        return UserTeamMemberQuery?.rows[0].id;
    } else {
        return null;
    }
};

// // Todo Controller
export const createTodo = async (
    req: AuthRequest,
    res: Response,
): Promise<void> => {
    try {
        const userId = req.userId;
        const { teamId } = req.params;
        const { locationId, title, description, dueDate } = req.body;

        //DEFAULT values
        const statusId = 1;

        const userTeamMemberId = await getUserTeamMemberId(teamId, userId);

        if (userTeamMemberId) {
            const statusUpdatedBy = userTeamMemberId;
            await db.query("BEGIN");
            const result = await db.query(
                `INSERT INTO todos
          (team_id, author_member_id, location_id, status_id, title, description, status_updated_by, due_date)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
                [
                    teamId,
                    userTeamMemberId,
                    locationId,
                    statusId,
                    title,
                    description,
                    statusUpdatedBy,
                    dueDate,
                ],
            );
            await db.query("COMMIT");
            res.status(201).json(result.rows[0]);
        } else {
            throw new Error("Team does not exist or user is not a member");
        }
    } catch (err) {
        await db.query("ROLLBACK");
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

export const updateTodoStatus = async (
    req: AuthRequest,
    res: Response,
): Promise<void> => {
    try {
        const { statusId } = req.body;
        const { teamId, todoId } = req.params;
        const userId = req.userId;
        const userTeamMemberId = await getUserTeamMemberId(teamId, userId);
        //TODO verify status is different
        if (userTeamMemberId) {
            const result = await db.query(
                "UPDATE todos SET status_id = $1, status_updated_by = $2 WHERE id = $3 AND team_id = $4 RETURNING *",
                [statusId, userTeamMemberId, todoId, teamId],
            );
            res.status(201).json(result.rows[0]);
        } else {
            throw new Error(
                "Todo does not exist or user is not a member of the team",
            );
        }
    } catch (err) {
        console.error(err);

        res.status(500).json({ message: "Server error" });
    }
};

// // Note Controller
export const createNote = async (
    req: AuthRequest,
    res: Response,
): Promise<void> => {
    try {
        const userId = req.userId;
        const { teamId } = req.params;
        const { todoId, locationId, content } = req.body;

        const userTeamMemberId = await getUserTeamMemberId(teamId, userId);
        if (userTeamMemberId) {
            const result = await db.query(
                `INSERT INTO notes
                  (team_id,author_member_id,todo_id,location_id,content)
                  VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                [teamId, userTeamMemberId, todoId, locationId, content],
            );
            res.status(201).json(result.rows[0]);
        } else {
            throw new Error("User is not a member of the team");
        }
    } catch (err) {
        console.error(err);

        res.status(500).json({ message: "Server error" });
    }
};

// // Reaction Controller
// export const addReaction = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const { reaction_type } = req.body;
//         const result = await db.query(
//             `INSERT INTO note_reactions (note_id, user_id, reaction_type)
//       VALUES ($1, $2, $3)
//       ON CONFLICT (note_id, user_id) DO UPDATE SET reaction_type = $3
//       RETURNING *`,
//             [req.params.noteId, req.user.id, reaction_type],
//         );
//         res.json(result.rows[0]);
//     } catch (err) {
//         res.status(500).json({ message: "Server error" });
//     }
// };
