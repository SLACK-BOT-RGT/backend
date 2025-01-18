import { NextFunction, Request, Response } from 'express';
import { CustomError } from '../utils/CustomError';


import { create_team_member, delete_team_member_by_id, get_all_teams_members, get_team_member_by_email, get_team_member_by_id } from '../services/team_members';


export const createTeamMemberRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, name, timeZone, id } = req.body;

        const existingTeamMember = await get_team_member_by_email({ email });

        if (existingTeamMember) throw new CustomError("Team Members  with this email already exist!", 409);


        const newTeamMember = await create_team_member({ email, name, timeZone, id });
        res.status(201).json({ data: newTeamMember , success: true });
    } catch (error) {
        next(error);
    }
};

export const getTeamMembersRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const team_members = await get_all_teams_members();

        res.status(200).json({ data: team_members, success: true });
    } catch (error) {
        next(error);
    }
};

export const getTeamMembersByIdRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const teamMember = await get_team_member_by_id({ id: req.params.id });

        if (!teamMember) throw new CustomError('Team Member not found', 404);

        res.status(200).json({ data: teamMember, success: true });
    } catch (error) {
        next(error);
    }
};

export const deleteTeamMemberRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const teamMember = await delete_team_member_by_id ({ id: req.params.id });

        res.status(200).json({ data: teamMember, success: true });
    } catch (error) {
        next(error);
    }
};