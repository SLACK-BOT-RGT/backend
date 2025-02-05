import { Request, Response } from 'express';
import { saveMoodTracking } from '../services/mood_tracking';
import MoodCheckin from '../model/moodCheckins';
import { Op } from 'sequelize';
import sequelize from '../config/database';

interface MoodCheckInRequest {
    user_id: string;
    team_id: string;
    mood_score: number;
    note?: string;
    is_anonymous?: boolean;
}

export const createMoodCheckinRequest = async (
    req: Request<{}, {}, MoodCheckInRequest>,
    res: Response
) => {
    try {
        const { user_id, team_id, mood_score, note, is_anonymous } = req.body;

        // Validate required fields
        if (!user_id || !team_id || !mood_score) {
            return res.status(400).json({
                message: 'Missing required fields: user_id, team_id, and mood_score are required'
            });
        }

        // Validate mood score range
        if (mood_score < 1 || mood_score > 5) {
            return res.status(400).json({
                message: 'Mood score must be between 1 and 5'
            });
        }

        const moodData = {
            user_id,
            team_id,
            mood_score,
            note: note || null,
            date: new Date(),
            is_anonymous: is_anonymous || false
        };

        await saveMoodTracking(moodData);

        res.status(201).json({
            message: 'Mood check-in created successfully',
            data: moodData
        });
    } catch (error) {
        console.error('Error creating mood check-in:', error);
        res.status(500).json({
            message: 'Failed to create mood check-in'
        });
    }
};

export const getMoodCheckinsRequest = async (req: Request, res: Response) => {
    try {
        const { team_id, user_id, start_date, end_date } = req.query;
        
        const whereClause: any = {};
        
        if (team_id) whereClause.team_id = team_id;
        if (user_id) whereClause.user_id = user_id;
        
        if (start_date && end_date) {
            whereClause.created_at = {
                [Op.between]: [new Date(start_date as string), new Date(end_date as string)]
            };
        }

        const moodCheckins = await MoodCheckin.findAll({
            where: whereClause,
            order: [['created_at', 'DESC']]
        });

        res.status(200).json({
            data: moodCheckins
        });
    } catch (error) {
        console.error('Error getting mood check-ins:', error);
        res.status(500).json({
            message: 'Failed to get mood check-ins'
        });
    }
};

export const getTeamMoodAnalyticsRequest = async (req: Request, res: Response) => {
    try {
        const { team_id } = req.params;
        const { start_date, end_date } = req.query;

        const whereClause: any = {
            team_id
        };

        if (start_date && end_date) {
            whereClause.created_at = {
                [Op.between]: [new Date(start_date as string), new Date(end_date as string)]
            };
        }

        const moodCheckins = await MoodCheckin.findAll({
            where: whereClause,
            attributes: [
                'mood_score',
                [sequelize.fn('COUNT', sequelize.col('mood_score')), 'count']
            ],
            group: ['mood_score']
        });

        const averageMoodResult = await MoodCheckin.findOne({
            where: whereClause,
            attributes: [
                [sequelize.fn('AVG', sequelize.col('mood_score')), 'average_mood']
            ],
            raw: true
        });

        res.status(200).json({
            data: {
                mood_distribution: moodCheckins,
                average_mood: averageMoodResult ? (averageMoodResult as any).average_mood || 0 : 0
            }
        });
    } catch (error) {
        console.error('Error getting team mood analytics:', error);
        res.status(500).json({
            message: 'Failed to get team mood analytics'
        });
    }
};