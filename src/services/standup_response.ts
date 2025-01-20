import { StandupConfigsModel, StandupResponseModel, TeamMemberModel } from "../model"
import StandupResponse from "../model/standupResponse";
import { CustomError } from "../utils/CustomError";

interface createStandupConfigResponsesProps {
   
    user_id: string,
    config_id:string
    responses: string
    submitted_at: string
    
}

export const create_standup_config_responses = async (standconfigResponsesData: createStandupConfigResponsesProps) => {

    const { user_id, config_id,responses,submitted_at} = standconfigResponsesData;

    const standupresponses = await StandupResponseModel.create();

    return standupresponses.dataValues;
}

export const get_responses = async () => {

    const responses = await StandupResponseModel.findAll();

    return responses;
}


export const get_responses_submitted= async () => {

    const responses_submitted = await StandupResponseModel .findAll();

    return responses_submitted;
}
