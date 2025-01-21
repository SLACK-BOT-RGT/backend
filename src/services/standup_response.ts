import { CustomError } from "../utils/CustomError";
import { IStandupResponses } from "../types/interfaces";
import { Op } from 'sequelize';
import { StandupConfigsModel, StandupResponseModel, TeamMemberModel, UserModel } from "../model"
import Team from "../model/team";


export const create_standup_responses = async (standconfigResponsesData: IStandupResponses) => {

    const { user_id, config_id, responses } = standconfigResponsesData;

    // Check if standup has already started today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingStandup = await StandupResponseModel.findOne({
        where: {
            config_id: config_id,
            user_id: user_id,
            submitted_at: {
                [Op.gte]: today
            }
        }
    });

    if (existingStandup) throw new CustomError("Today's standup has already been started!", 409);



    const standupresponses = await StandupResponseModel.create({
        user_id: user_id,
        config_id: parseInt(config_id),
        responses,
        submitted_at: new Date()
    });

    return standupresponses.dataValues;
}

export const get_standup_responses = async () => {
    try {

        // Fetch responses with their associated configuration and team in a single query
        const responses = await StandupResponseModel.findAll({
            include: [
                {
                    model: StandupConfigsModel,
                    include: [Team], // Include the Team relation within the config
                },
            ],
        });



        return responses;
    } catch (error) {
        console.log('====================================');
        console.log(error);
        console.log('====================================');
    }
};

interface StandupResponse {
    user_id: string;
    submitted_at: Date; // Corrected type
    responses: string[];
    StandupConfig?: {
        questions: string[];
        Team?: {
            name: string;
        };
    };
}


export const get_drafted_standup_responses = async () => {
    try {
        const users = await UserModel.findAll();
        const team_members = await TeamMemberModel.findAll();
        const responses = await StandupResponseModel.findAll({
            include: [
                {
                    model: StandupConfigsModel,
                    include: [Team],
                },
            ],
        });

        const structuredResponses = responses.map((response) => {
            // Cast the response to include StandupConfig
            const castedResponse = response as StandupResponse & {
                StandupConfig?: {
                    questions: string[];
                    Team?: { name: string, id: string };
                };
            };

            const user = users.find((user) => user.id === response.user_id);
            const standupConfig = castedResponse.StandupConfig;

            return {
                member: user?.name || "Unknown Member",
                team: standupConfig?.Team?.name || "Unknown Team",
                team_id: standupConfig?.Team?.id || "Unknown Team",
                date: response.submitted_at,
                status: "Completed",
                standup: standupConfig?.questions.map((question, index) => ({
                    question,
                    response: response.responses[index] || "No Response",
                })) || [],
                submittedAt: response.submitted_at,
            };
        });

        return structuredResponses;
    } catch (error) {
        console.error("Error fetching drafted standup responses:", error);
        return [];
    }
};




//   
