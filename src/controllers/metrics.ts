import { Request, Response, NextFunction } from "express";
import { get_combined_metrics, get_kudos_category, get_quickest_responder } from "../services/metrics";
import { get_collaboration, get_kudos } from "../services/kudos";

export const getCombinedMetricsRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { team_id } = req.params;
        const { month } = req.query;

        const monthDate = month ? new Date(month as string) : undefined;
        const trendData = await get_combined_metrics({ month: monthDate });
        const kudosCategories = await get_kudos_category({ month: monthDate });
        const quickestResponder = await get_quickest_responder({ month: monthDate });
        const topPerformer = (await get_kudos({ team_id, month: monthDate }))[0];
        const collaboration = (await get_collaboration({ team_id, month: monthDate }))[0];

        let data = {
            trendData: trendData,
            kudosCategories: kudosCategories,
            quickestResponder: quickestResponder,
            topPerformer: topPerformer,
            collaboration: collaboration
        }

        res.status(200).json({ data: data, success: true });
    } catch (error) {
        next(error);
    }
};
