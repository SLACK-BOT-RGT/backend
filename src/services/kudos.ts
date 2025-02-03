// import { KUDOS_VALUES } from "../constants/constants";
import { KudosModel, TeamModel, UserModel } from "../model";
import { Op } from 'sequelize';
import { get_all_users } from "./users";
interface LeaderboardEntry {
    id: string;
    name: string;
    kudosReceived: number;
    topCategory: string;
    kudosGiven: number;
    highlights: string[];
}

// Define the type for the kudos types
type KudosType = "rocket" | "heart" | "thumbs";

export const KUDOS_VALUES: Record<KudosType, number> = {
    rocket: 3,
    heart: 2,
    thumbs: 1,
};


const formatLeaderboardData = async (kudosData: any[]) => {
    const userStats: Record<string, any> = {};
    const users = await get_all_users();

    // Process each kudos entry to calculate kudosReceived, kudosGiven, and categories
    kudosData.forEach((kudos) => {
        const { to_user_id, from_user_id, type, category } = kudos;
        const kudosValue = KUDOS_VALUES[type as KudosType] || 0;

        // Initialize stats for the receiver if not present
        if (!userStats[to_user_id]) {
            userStats[to_user_id] = {
                id: to_user_id,
                kudosReceived: 0,
                kudosGiven: 0,
                categories: {},
                name: users.find((user) => user.id == to_user_id)?.name,
            };
        }

        // Initialize stats for the sender if not present
        if (!userStats[from_user_id]) {
            userStats[from_user_id] = {
                id: from_user_id,
                kudosReceived: 0,
                kudosGiven: 0,
                categories: {},
                name: users.find((user) => user.id == from_user_id)?.name || "Unkown",
            };
        }

        // Add to kudosReceived for the receiver
        userStats[to_user_id].kudosReceived += kudosValue;

        // Add to kudosGiven for the sender
        userStats[from_user_id].kudosGiven += kudosValue;

        // Count categories for highlights for the receiver
        if (!userStats[to_user_id].categories[category]) {
            userStats[to_user_id].categories[category] = 0;
        }
        userStats[to_user_id].categories[category] += 1;
    });

    // Calculate highlights (top 2 categories)
    const leaderboardData = Object.values(userStats).map((user) => {
        const sortedCategories = Object.entries(user.categories as Record<string, number>)
            .sort(([, countA], [, countB]) => countB - countA)
            .slice(0, 2)
            .map(([category]) => category);

        return {
            id: user.id,
            name: user.name,
            kudosReceived: user.kudosReceived,
            kudosGiven: user.kudosGiven,
            topCategory: sortedCategories[0],
            highlights: sortedCategories,
        };
    });

    return leaderboardData;
};






export const get_kudos = async ({ team_id, month }: { team_id: string, month?: Date }) => {
    // If month is undefined, use the current month
    const targetDate = month || new Date();

    // Get the first and last day of the target month
    const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59);

    // Fetch kudos within the month range
    const kudos = await KudosModel.findAll({
        where: {
            team_id: team_id,
            created_at: {
                [Op.between]: [startOfMonth, endOfMonth],
            },
        },
        include: [TeamModel, UserModel],
    });

    const data = await formatLeaderboardData(kudos);
    return data;
};