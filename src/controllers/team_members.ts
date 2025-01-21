import { NextFunction, Request, Response } from 'express';
import { CustomError } from '../utils/CustomError';
import { create_team_member, delete_team_member_by_id, get_all_teams_members, get_team_member_by_id, get_team_members_today_status, get_team_members_week_status, update_team_member } from '../services/team_members';
import { get_user_by_id } from '../services/users';
import { WebClient } from '@slack/web-api';
import { get_team_by_id } from '../services/team';
import { ITeam } from '../types/interfaces';

const client = new WebClient(process.env.SLACK_BOT_TOKEN);


export const createTeamMemberRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { data } = req.body;

        const newTeamMembers = await Promise.all(
            data.map(async (member: any) => {
                const { role, team_id, user_id } = member;

                const user = await get_user_by_id({ id: user_id });
                if (!user) throw new CustomError("User not found!", 404);

                const team: ITeam = await get_team_by_id({ id: team_id });
                if (!team) throw new CustomError("Team not found!", 404);

                const teamMembers = await get_all_teams_members();
                const existingTeamMember = teamMembers.find(
                    (item) => item.team_id === team_id && item.user_id === user_id
                );

                if (existingTeamMember) throw new CustomError("Member already exists!", 409);

                const newMember = await create_team_member({ role, team_id, user_id });

                // Fetch channel info
                const channelList = await client.conversations.list();
                const channel = channelList.channels?.find((ch) => ch.name === team.name);

                if (!channel || !channel.id) {
                    throw new CustomError(`Channel "#${team.name}" not found.`, 404);
                }

                // Invite user to channel
                await client.conversations.invite({ channel: channel.id, users: user.id });

                return newMember;

            })
        );

        res.status(201).json({ data: newTeamMembers, success: true });
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

export const updateTeamMemberRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { role } = req.body;
        const teamMember = await update_team_member({ id: req.params.id, role });

        res.status(200).json({ data: teamMember, success: true });
    } catch (error) {
        next(error);
    }
};

export const deleteTeamMemberRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const teamMember = await delete_team_member_by_id({ id: req.params.id });

        res.status(200).json({ data: teamMember, success: true });
    } catch (error) {
        next(error);
    }
};



export const getTeamMembersTodayStatusRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { team_id } = req.params;
        const team_members = await get_team_members_today_status({ team_id });

        res.status(200).json({ data: team_members, success: true });
    } catch (error) {
        next(error);
    }
};

export const getTeamMembersWeekStatusRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { team_id } = req.params;
        const team_members = await get_team_members_week_status({ team_id });

        res.status(200).json({ data: team_members, success: true });
    } catch (error) {
        next(error);
    }
};