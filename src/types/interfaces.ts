import { Request } from "express";
export interface IUser {
    id?: string;
    name: string;
    email: string;
    timeZone: string;
    is_admin: boolean;
}
export interface IStandupConfig {
    id?: number;
    team_id: string;
    questions: string[];
    reminder_time: string;
    due_time: string;
    reminder_days: string[];
    is_active?: boolean;
}
export interface IStandupResponses {
    id?: number;
    user_id: string;
    config_id: number;
    responses: any;
    submitted_at?: Date;
    status?: 'responded' | 'not responded' | 'missed';
}
export interface AuthRequest extends Request {
    user?: IUser;
}
export interface ITeam {
    id: string;
    name: string;
    description: string;
    archived: boolean;
}
export interface IPoll {
    id?: number;
    team_id: string;
    creator_id: string;
    question: string;
    options: IPollOption[];
    is_anonymous: boolean;
    start_time: Date;
    end_time: Date;
    // status: 'draft' | 'active' | 'closed';
    total_votes?: number;
}


export interface IPollOption {
    id: string;
    text: string;
    votes: number;
    voters?: { id: string, name: string, submitted_at: Date }[];
}
