export interface IUser {
    id?: string;
    name: string;
    email: string;
    timeZone: string;
}
export interface IStandupConfig {
    id?: number;
    team_id: string;
    questions: string[];
    reminder_time: string;
    reminder_days: string[];
    is_active?: boolean;
}