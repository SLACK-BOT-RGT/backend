import { Request, Response, NextFunction } from "express";
import { get_kudos } from "../services/kudos";

export const getKudosRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { team_id } = req.params;
        const { month } = req.query;

        // If a month is provided, parse it; otherwise, it will be undefined
        const monthDate = month ? new Date(month as string) : undefined;
        const kudos = await get_kudos({ team_id, month: monthDate });

        res.status(200).json({ data: kudos, success: true });
    } catch (error) {
        next(error);
    }
};