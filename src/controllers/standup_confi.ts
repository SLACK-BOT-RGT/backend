import { NextFunction, Request, Response } from 'express';
import { CustomError } from '../utils/CustomError';
import { get_team_by_id } from '../services/team';
import { create_standup_config, get_team_standup_config, update_standup_config } from '../services/standup_config';


export const createStandupConfigRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { team_id, reminder_days, reminder_time, questions, due_time } = req.body;

        console.log('====================================');
        console.log("IN");
        console.log('====================================');
        const team = await get_team_by_id({ id: team_id });
        if (!team) throw new CustomError("Team not found", 404);

        const standconfig = await get_team_standup_config({ team_id });
        if (standconfig) throw new CustomError("standconfig already exist!", 409);

        const newQuestion = await create_standup_config({ questions, reminder_days, reminder_time, team_id, due_time });

        res.status(201).json({ data: newQuestion, success: true });
    } catch (error) {
        console.log('====================================');
        console.log(error);
        console.log('====================================');
        next(error);
    }
};

export const getTeamStandupConfigRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { team_id } = req.params;
        const time = await get_team_standup_config({ team_id });

        res.status(200).json({ data: time, success: true });
    } catch (error) {
        next(error);
    }
};

export const updateStandupConfigRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { config_id } = req.params;
        const { team_id, reminder_days, reminder_time, questions, due_time } = req.body;

        const team = await get_team_by_id({ id: team_id });
        if (!team) throw new CustomError("Team not found", 404);

        const { data, status } = await update_standup_config({ questions, reminder_days, reminder_time, team_id, id: parseInt(config_id), due_time });

        res.status(status).json({ data: data, success: true });
    } catch (error) {
        next(error);
    }
};

