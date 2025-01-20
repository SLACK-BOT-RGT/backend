import { StandupConfigsModel, TeamMemberModel } from "../model"
import Team from "../model/team";
import { IStandupConfig } from "../types/interfaces";
import { CustomError } from "../utils/CustomError";
import { get_team_by_id } from "./team";


export const create_standup_config = async (standconfigData: IStandupConfig) => {

    const { team_id, questions, reminder_days, reminder_time } = standconfigData;

    const standconfig = await StandupConfigsModel.create({
        team_id, questions, reminder_days, reminder_time
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

    return reminder_time;
}


export const update_standup_config = async (standconfigData: IStandupConfig) => {
    const { team_id, questions, reminder_days, reminder_time, id } = standconfigData;

    const standconfig = await StandupConfigsModel.findByPk(id);

    if (!standconfig) throw new CustomError(`Standup config not found`, 404);

    await standconfig.update({
        team_id, questions, reminder_days, reminder_time
    });

    return standconfig.dataValues;
}
