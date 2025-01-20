import { NextFunction, Request, Response } from 'express';
import { CustomError } from '../utils/CustomError';
import { delete_team_by_id, get_all_teams, get_team_by_id, update_team_by_id } from '../services/team';
import { create_Team } from '../services/team';
import { get_reminder_days, get_reminder_time } from '../services/standup_config';



export const createStandupConfigQuestionsRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { team_id,id, reminder_days,  reminder_time, is_active  } = req.body;

        const questions = await get_all_teams();

        const existtingQuestions = questions.find((item) => item.questions == questions);

        if (existtingQuestions) throw new CustomError("Questions already exist!", 409);
// I don't ge t this code
        const newQuestion = await create_standup_config_questions({team_id,id, reminder_days,  reminder_time, is_active});

        res.status(201).json({ data: newQuestion, success: true });
    } catch (error) {
        next(error);
    }
};

export const getReminderTimeRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const time = await get_reminder_time();

        res.status(200).json({ data: time, success: true });
    } catch (error) {
        next(error);
    }
};

export const getReminderDaysRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const time = await get_reminder_days();

        res.status(200).json({ data: time, success: true });
    } catch (error) {
        next(error);
    }
};

