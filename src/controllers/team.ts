import { create_Team } from '../services/team';
import { CustomError } from '../utils/CustomError';
import { delete_team_by_id, get_all_teams, get_team_by_id, update_team_by_id } from '../services/team';
import { NextFunction, Request, Response } from 'express';
import { WebClient } from '@slack/web-api';

const client = new WebClient(process.env.SLACK_BOT_TOKEN);

export const createTeamRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, description } = req.body;
        const formattedName = name.toLowerCase().replace(/\s+/g, "-");

        const teams = await get_all_teams();

        const existtingTeams = teams.find((item) => item.name == name);

        if (existtingTeams) throw new CustomError("Team already exist!", 409);

        if (!process.env.SLACK_BOT_TOKEN) {
            throw new CustomError("SLACK_BOT_TOKEN is not set in the environment variables", 500);
        }

        const channelResponse = await client.conversations.create({
            name: formattedName,
            is_private: false,
        });

        if (!channelResponse.ok || !channelResponse.channel?.id) {
            throw new CustomError(
                `Failed to create channel. Slack response: ${JSON.stringify(channelResponse)}`,
                505
            );
        }

        const channelId = channelResponse.channel.id;

        const newTeam = await create_Team({ id: channelId, name: name, description });

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
        const team = await get_team_by_id({ id: req.params.id });
        if (!team) throw new CustomError("Team not found", 404);

        const channelList = await client.conversations.list();

        const slackChannel = channelList.channels?.find(
            (ch) => ch.name === team.name
        );

        if (!slackChannel || !slackChannel.id) {
            throw new CustomError(`Channel "#${team.name}" not found on Slack.`, 404)
        }

        await client.conversations.archive({ channel: slackChannel.id });

        const deletedTeam = await delete_team_by_id({ id: req.params.id });
        res.status(200).json({ data: deletedTeam, success: true });
    } catch (error) {
        next(error);
    }
};