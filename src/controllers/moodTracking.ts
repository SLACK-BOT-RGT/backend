import { NextFunction, Request, Response } from 'express';
import { get_monthly_moods } from '../services/mood_tracking';

export const getMoodRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { team_id } = req.params;
        const { month } = req.query;

        // If a month is provided, parse it; otherwise, it will be undefined
        const monthDate = month ? new Date(month as string) : undefined;
        const moods = await get_monthly_moods({ team_id, month: monthDate });

        res.status(200).json({ data: moods, success: true });
    } catch (error) {
        next(error);
    }
};
