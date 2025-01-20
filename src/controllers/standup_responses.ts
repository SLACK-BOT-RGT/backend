import { NextFunction, Request, Response } from 'express';
import { CustomError } from '../utils/CustomError';
import { delete_team_by_id, get_all_teams, get_team_by_id, update_team_by_id } from '../services/team';
import { create_Team } from '../services/team';
import { get_reminder_days, get_reminder_time } from '../services/standup_config';
import { create_standup_config_responses, get_responses, get_responses_submitted } from '../services/standup_response';



export const createStandupConfigResponsesRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user_id, config_id, responses,submitted_at } = req.body;

        const respnses = await get_responses();

        const existtingResponses =responses.find((item: { responses: any; }) => item.responses == responses);

        if (existtingResponses) throw new CustomError("Responses already exist!", 409);

        const newResponses= await create_standup_config_responses({user_id, config_id,responses, submitted_at});

        res.status(201).json({ data: newResponses, success: true });
    } catch (error) {
        next(error);
    }
};

export const getSubmittedTimeRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const time = await get_responses_submitted();

        res.status(200).json({ data: time, success: true });
    } catch (error) {
        next(error);
    }
};

