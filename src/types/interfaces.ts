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