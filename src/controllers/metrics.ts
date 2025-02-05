import { Request, Response, NextFunction } from "express";
import { get_combined_metrics, get_kudos_category, get_quickest_responder } from "../services/metrics";
import { get_collaboration, get_kudos } from "../services/kudos";
import { get_monthly_moods } from "../services/mood_tracking";

export const getCombinedMetricsRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { team_id } = req.params;
        const { month } = req.query;

        const monthDate = month ? new Date(month as string) : undefined;
        const trendData = await get_combined_metrics({ team_id, month: monthDate });
        const kudosCategories = await get_kudos_category({ team_id, month: monthDate });
        const quickestResponder = await get_quickest_responder({ team_id, month: monthDate });
        const topPerformer = (await get_kudos({ team_id, month: monthDate }))[0];
        const collaboration = (await get_collaboration({ team_id, month: monthDate }))[0];
        const moods = await get_monthly_moods({ team_id, month: monthDate });

        let data = {
            trendData: trendData,
            kudosCategories: kudosCategories,
            quickestResponder: quickestResponder,
            topPerformer: topPerformer,
            collaboration: collaboration,
            moods: moods
        }

        res.status(200).json({ data: data, success: true });
    } catch (error) {
        next(error);
    }
};
