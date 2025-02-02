import { NextFunction, Request, Response } from "express";
import { create_poll, get_poll_by_id, get_team_polls, vote_on_poll } from "../services/polls";
import { get_team_by_id } from "../services/team";
import { CustomError } from "../utils/CustomError";
import { get_user_by_id } from "../services/users";


export const createPollRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { team_id, end_time, creator_id, is_anonymous, options, question, start_time } = req.body;

        const team = await get_team_by_id({ id: team_id });
        if (!team) throw new CustomError("Team not found", 404);

        const user = await get_user_by_id({ id: creator_id });
        if (!user) throw new CustomError("Team not found", 404);

        const poll = await create_poll({ team_id, end_time, creator_id, is_anonymous, options, question, start_time });

        res.status(201).json({ data: poll, success: true });
    } catch (error) {
        next(error);
    }
};


export const getTeamPollsRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { team_id } = req.params;

        const polls = await get_team_polls({ team_id });

        res.status(200).json({ data: polls, success: true });
    } catch (error) {
        next(error);
    }
};


export const getPollByIdRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { poll_id } = req.params;
        const poll = await get_poll_by_id({ id: poll_id });

        res.status(200).json({ data: poll, success: true });
    } catch (error) {
        next(error);
    }
};

export const voteOnPollRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { option_id, poll_id, user_id } = req.body;

        const user = await get_user_by_id({ id: user_id });
        if (!user) throw new CustomError("Team not found", 404);

        const poll = await vote_on_poll({ option_id, poll_id, user_id });

        res.status(200).json({ data: poll, success: true });
    } catch (error) {
        next(error);
    }
};