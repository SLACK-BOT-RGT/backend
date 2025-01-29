import { StandupConfigsModel, TeamMemberModel } from "../model"
import Team from "../model/team";
import { IStandupConfig } from "../types/interfaces";
import { CustomError } from "../utils/CustomError";
import { get_team_by_id } from "./team";


export const create_standup_config = async (standconfigData: IStandupConfig) => {

    const { team_id, questions, reminder_days, reminder_time, due_time } = standconfigData;

    const standconfig = await StandupConfigsModel.create({
        team_id, questions, reminder_days, reminder_time,
    });

    return standconfig.dataValues;
}

export const get_team_standup_config = async ({ team_id }: { team_id: string }) => {

    const reminder_time = await StandupConfigsModel.findOne({
        where: {
            team_id
        },
        include: [Team]
    });

    return reminder_time?.dataValues;
}

export const get_standup_config_by_id = async ({ id }: { id: string }) => {

    const reminder_time = await StandupConfigsModel.findByPk(id);

    return reminder_time?.dataValues;
}


export const update_standup_config = async (standconfigData: IStandupConfig) => {
    const { team_id, questions, reminder_days, reminder_time, id, due_time } = standconfigData;

    const standconfig = await StandupConfigsModel.findByPk(id);

    if (!standconfig) {
        const standconfigData = await create_standup_config({ questions, reminder_days, reminder_time, team_id, due_time });

        return { data: standconfigData, status: 201 }

    } else {
        await standconfig.update({
            team_id, questions, reminder_days, reminder_time, due_time
        });

        return { data: standconfig.dataValues, status: 200 };

    }



}
