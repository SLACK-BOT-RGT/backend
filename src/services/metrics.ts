import { KUDOS_CATEGORY } from "../constants/constants";
import { KudosModel, PollModel, StandupConfigsModel, StandupResponseModel, UserModel } from "../model";
// import { Op } from "sequelize";
import { Op, fn, col, literal } from 'sequelize';

// Define the Kudos types and their respective values
type KudosType = "rocket" | "heart" | "thumbs";

export const KUDOS_VALUES: Record<KudosType, number> = {
    rocket: 3,
    heart: 2,
    thumbs: 1,
};

// Function to get the week number from a date
const getWeekOfMonth = (date: Date) => {
    const day = date.getDate();
    return Math.ceil(day / 7); // 1st-7th -> W1, 8th-14th -> W2, etc.
};

export const get_combined_metrics = async ({ month }: { month?: Date }) => {
    // If month is undefined, use the current month
    const targetDate = month || new Date();

    // Get the first and last day of the target month
    const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59);

    // Calculate number of weeks in the month
    const weeksInMonth = getWeekOfMonth(endOfMonth);

    // Initialize week-based data dynamically based on number of weeks
    const trendData = Array.from({ length: weeksInMonth }, (_, index) => ({
        week: `W${index + 1}`,
        mood: 0,  // Initialize all moods to 0
        kudos: 0,
        pollParticipation: 0
    }));

    // Fetch data for the specific month
    const kudos = await KudosModel.findAll({
        where: {
            created_at: {
                [Op.between]: [startOfMonth, endOfMonth],
            },
        },
    });

    const polls = await PollModel.findAll({
        where: {
            end_time: {
                [Op.between]: [startOfMonth, endOfMonth],
            },
        },
    });

    // Calculate Kudos for each week
    kudos.forEach((kudo: any) => {
        const weekIndex = getWeekOfMonth(new Date(kudo.created_at)) - 1;
        const kudoValue = KUDOS_VALUES[kudo.type as KudosType] || 0;
        if (weekIndex >= 0 && weekIndex < trendData.length) {
            trendData[weekIndex].kudos += kudoValue;
        }
    });

    // Calculate Poll Participation for each week
    polls.forEach((poll: any) => {
        const weekIndex = getWeekOfMonth(new Date(poll.end_time)) - 1;
        if (weekIndex >= 0 && weekIndex < trendData.length) {
            trendData[weekIndex].pollParticipation += poll.total_votes;
        }
    });

    return trendData;
};


export const get_kudos_category = async ({ month }: { month?: Date }) => {
    const targetDate = month || new Date();

    const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59);

    const kudos = await KudosModel.findAll({
        where: {
            created_at: {
                [Op.between]: [startOfMonth, endOfMonth],
            },
        },
    });

    // Initialize category counts
    const categoryCounts: Record<string, number> = {
        Helpful: 0,
        Innovation: 0,
        Teamwork: 0,
        Leadership: 0,
        Support: 0,
    };

    // Count kudos per category
    kudos.forEach((kudo: any) => {
        if (categoryCounts.hasOwnProperty(kudo.category)) {
            categoryCounts[kudo.category] += 1;
        }
    });

    // Format data
    const kudosCategories = KUDOS_CATEGORY.map(category => ({
        name: category,
        value: categoryCounts[category] || 0,
    }));

    return kudosCategories.filter((item) => item.value > 0);
};















// ==============================================
interface StandupResponseMap {
    [key: string]: {
        total: number;
        count: number;
        name: string;
    };
}

interface PollResponseMap {
    [key: string]: {
        total: number;
        count: number;
        name: string;
    };
}

interface CombinedResponseTimesMap {
    [key: string]: {
        total: number;
        count: number;
        name: string;
    };
}

type FastestUser = { userId: string; name: string; avgResponseTime: number } | null;
export const get_quickest_responder = async ({ month }: { month?: Date }) => {
    // Step 1: Calculate the target month (default to the current month if not provided)
    const targetDate = month || new Date();
    const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59);

    // Step 2: Calculate average standup response time per user for the specific month
    // const standupResponseTimes = await StandupResponseModel.findAll({
    //     include: [
    //         {
    //             model: StandupConfigsModel,
    //             attributes: ['reminder_time'],
    //         },
    //         {
    //             model: UserModel,
    //             attributes: ['id', 'name'],
    //         },
    //     ],
    //     attributes: [
    //         'user_id',
    //         [literal(`EXTRACT(EPOCH FROM (submitted_at - reminder_time))`), 'response_time'],
    //     ],
    //     where: {
    //         status: 'responded',
    //         submitted_at: {
    //             [Op.gte]: startOfMonth, // Filter for records after the start of the month
    //             [Op.lte]: endOfMonth,   // Filter for records before the end of the month
    //         }
    //     },
    //     raw: true
    // });

    // Aggregate standup response times
    // const standupResponseMap: StandupResponseMap = {};
    // standupResponseTimes.forEach((response: any) => {
    //     if (!standupResponseMap[response.user_id]) {
    //         standupResponseMap[response.user_id] = {
    //             total: 0,
    //             count: 0,
    //             name: response.User.name
    //         };
    //     }
    //     standupResponseMap[response.user_id].total += parseFloat(response.response_time);
    //     standupResponseMap[response.user_id].count += 1;
    // });

    // Step 3: Calculate average poll response time per user for the specific month
    const pollResponses = await PollModel.findAll({
        attributes: ['options', 'start_time'],
        include: [{
            model: UserModel,
            attributes: ['id', 'name']
        }],
        raw: true
    });

    const pollResponseMap: PollResponseMap = {};

    pollResponses.forEach(poll => {
        const pollStartTime = new Date(poll.start_time);
        if (pollStartTime >= startOfMonth && pollStartTime <= endOfMonth) { // Filter by month
            poll.options.forEach(option => {
                if (option.voters && option.voters.length > 0) {
                    option.voters.forEach(voter => {
                        const responseTime = new Date(voter.submitted_at).getTime() - pollStartTime.getTime();
                        if (!pollResponseMap[voter.id]) {
                            pollResponseMap[voter.id] = { total: 0, count: 0, name: voter.name };
                        }
                        pollResponseMap[voter.id].total += responseTime / 1000;  // Convert ms to seconds
                        pollResponseMap[voter.id].count += 1;
                    });
                }
            });
        }
    });

    // Step 4: Combine Standup and Poll Responses
    const combinedResponseTimes: CombinedResponseTimesMap = {};

    // Object.keys(standupResponseMap).forEach(userId => {
    //     combinedResponseTimes[userId] = {
    //         total: standupResponseMap[userId].total,
    //         count: standupResponseMap[userId].count,
    //         name: standupResponseMap[userId].name,
    //     };
    // });

    Object.keys(pollResponseMap).forEach(userId => {
        if (combinedResponseTimes[userId]) {
            combinedResponseTimes[userId].total += pollResponseMap[userId].total;
            combinedResponseTimes[userId].count += pollResponseMap[userId].count;
        } else {
            combinedResponseTimes[userId] = {
                total: pollResponseMap[userId].total,
                count: pollResponseMap[userId].count,
                name: pollResponseMap[userId].name,
            };
        }
    });

    // Step 5: Find the user with the best (lowest) average response time
    const quickestUser = Object.entries(combinedResponseTimes).reduce<FastestUser>((fastest, [userId, data]) => {
        const avgResponseTime = parseFloat((data.total / data.count / 3600).toFixed(4));
        if (!fastest || avgResponseTime < fastest.avgResponseTime) {
            return { userId, name: data.name, avgResponseTime: avgResponseTime };
        }
        return fastest;
    }, null);

    return quickestUser || 'Nobody';
}


