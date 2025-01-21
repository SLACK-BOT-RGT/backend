import { NextFunction, Request, Response } from 'express';
import { CustomError } from '../utils/CustomError';
import { get_standup_config_by_id } from '../services/standup_config';
import { create_standup_responses, get_drafted_standup_responses, get_standup_responses } from '../services/standup_response';


export const createStandupResponsesRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user_id, config_id, responses } = req.body;

        const standconfig = await get_standup_config_by_id({ id: config_id });
        if (!standconfig || !standconfig.is_active) throw new CustomError("No active standup configuration found for this team.", 404);

        const newResponses = await create_standup_responses({ user_id, config_id, responses });

        res.status(201).json({ data: newResponses, success: true });
    } catch (error) {
        next(error);
    }
};

export const getStandupResponsesRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const responses = await get_standup_responses();

        res.status(200).json({ data: responses, success: true });
    } catch (error) {
        next(error);
    }
};
export const getDraftedStandupResponsesRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const responses = await get_drafted_standup_responses();

        res.status(200).json({ data: responses, success: true });
    } catch (error) {
        next(error);
    }
};
