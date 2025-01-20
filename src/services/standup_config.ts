import { StandupConfigsModel, TeamMemberModel } from "../model"
import { CustomError } from "../utils/CustomError";

interface createStandupConfigProps {
   id:string,
    team_id: string,
    questions:string
    reminder_time: string
    reminder_days: string
    is_active:string
}

export const create_standup_config_questions = async (standconfigData: createStandupConfigProps) => {

    const { id,  team_id , questions, reminder_days, reminder_time, is_active} = standconfigData;

    const question = await StandupConfigsModel.create();

    return question.dataValues;
}

export const get_reminder_time = async () => {

    const reminder_time = await StandupConfigsModel.findAll();

    return reminder_time;
}


export const get_reminder_days = async () => {

    const reminder_days = await StandupConfigsModel.findAll();

    return reminder_days;
}
