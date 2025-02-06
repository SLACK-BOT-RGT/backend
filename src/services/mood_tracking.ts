import { MoodModel } from "../model";
import MoodCheckin from "../model/moodCheckins"
import { IMoodTracking } from "../types/interfaces"
import { Op } from "sequelize";
import { CustomError } from "../utils/CustomError";

export const create_mood = async (data: IMoodTracking) => {
    try {
        const { is_anonymous, mood_score, note, user_id, team_id } = data;

        const mood = await MoodCheckin.create({ is_anonymous, mood_score, note, user_id, team_id });

        mood.dataValues;
    } catch (error) {
        console.error("Error saving mood tracking:", error)
        throw error
    }
}

export const update_mood = async ({ id, is_anonymous, mood_score, note, team_id, user_id }: IMoodTracking) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const mood = await MoodModel.findOne({
        where: {
            user_id: user_id,
            team_id,
            created_at: {
                [Op.gte]: today
            }
        }
    });

    if (!mood) throw new CustomError(`Mood with id ${id} not found`, 404);

    await mood.update({
        is_anonymous, mood_score, note
    });

    return mood.dataValues;
}

const MOOD_LABELS: Record<number, string> = {
    1: "Unhappy",
    2: "Neutral",
    3: "Happy",
    4: "Very Happy",
};


export const get_monthly_moods = async ({ team_id, month }: { team_id: string, month?: Date }) => {
    const targetDate = month ? new Date(month) : new Date();

    const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1, 0, 0, 0);
    const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59, 999);

    const moods = await MoodModel.findAll({
        where: {
            team_id: team_id,
            created_at: {
                [Op.between]: [startOfMonth, endOfMonth],
            },
        },
    });

    // Counting logic remains the same
    const moodCounts = {
        "Unhappy": 0,
        "Neutral": 0,
        "Happy": 0,
        "Very Happy": 0,
    };

    moods.forEach((mood) => {
        const moodLabel = MOOD_LABELS[mood.mood_score as number];
        if (moodLabel) {
            moodCounts[moodLabel as keyof typeof moodCounts] += 1;
        }
    });

    const formattedMoods = Object.entries(moodCounts).map(([mood, count]) => ({
        mood,
        count,
    }));

    return formattedMoods;
};



export const get_team_monthly_moods = async ({ month }: { month?: Date }) => {
    const targetDate = month || new Date();

    const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59);

    const kudos = await MoodModel.findAll({
        where: {
            created_at: {
                [Op.between]: [startOfMonth, endOfMonth],
            },
        },
    });

    return kudos;
}


export const get_daily_moods = async ({ team_id, month }: { team_id: string, month?: Date }) => {
    const targetDate = month ? new Date(month) : new Date();

    const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1, 0, 0, 0);
    const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59, 999);

    const moods = await MoodModel.findAll({
        where: {
            team_id: team_id,
            created_at: {
                [Op.between]: [startOfMonth, endOfMonth],
            },
        },
    });

    // Initialize an object to hold moods grouped by user ID
    const userMoods: { [userId: string]: { date: string; mood: number; note: string }[] } = {};

    moods.forEach((mood) => {
        const userId = mood.user_id; // Use user_id as the key
        const date = new Date(mood.created_at).getDate().toString(); // Extract day of the month as string
        const moodScore = mood.mood_score as number;
        const note = mood.note || '';

        if (!userMoods[userId]) {
            userMoods[userId] = [];
        }

        userMoods[userId].push({
            date,
            mood: moodScore,
            note,
        });
    });

    return userMoods;
};

