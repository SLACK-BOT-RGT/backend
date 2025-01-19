import { NextFunction, Request, Response } from 'express';
import { CustomError } from '../utils/CustomError';
import { delete_team_by_id, get_all_teams, get_team_by_id, update_team_by_id } from '../services/team';
import { create_Team } from '../services/team';



export const createTeamRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, name, description } = req.body;

        const teams = await get_all_teams();

        const existtingTeams = teams.find((item) => item.name == name);

        if (existtingTeams) throw new CustomError("Team already exist!", 409);

        const newTeam = await create_Team({ id, name, description });

        res.status(201).json({ data: newTeam, success: true });
    } catch (error) {
        next(error);
    }
};

export const getTeamsRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const teams = await get_all_teams();

        res.status(200).json({ data: teams, success: true });
    } catch (error) {
        next(error);
    }
};

export const getTeamByIdRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const team = await get_team_by_id({ id: req.params.id });

        if (!team) throw new CustomError('User not found', 404);

        res.status(200).json({ data: team, success: true });
    } catch (error) {
        next(error);
    }
};

export const updateTeamByIdRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, description } = req.body;

        const team = await update_team_by_id({ id: req.params.id, name, description });

        res.status(200).json({ data: team, success: true });
    } catch (error) {
        next(error);
    }
};


export const deleteTeamRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const team = await delete_team_by_id({ id: req.params.id });

        res.status(200).json({ data: team, success: true });
    } catch (error) {
        next(error);
    }
};