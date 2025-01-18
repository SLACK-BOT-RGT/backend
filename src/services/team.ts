import { TeamModel } from "../model";
import Team from "../model/team";
import { CustomError } from "../utils/CustomError";

interface createTeamProps {
    id: string;
    name: string;
    description: string;
}
export const create_Team = async ({ id, name, description }: createTeamProps) => {
    const team = await TeamModel.create({ id, name, description });
}
export const get_all_teams = async () => {

    const teams = await  TeamModel.findAll();

    return  teams;
}
export const get_team_by_email = async ({ email }: { email: string }) => {

    const team = await Team.findOne({
        where: {
            email: email
        }
    });

    return team?.dataValues;
}

export const get_team_by_id = async ({ id }: { id: string }) => {

    const team = await Team.findOne({
        where: {
            id: id
        }
    });

    return team?.dataValues;
}
export const update_team_by_id = async ({ id }: { id: string }) => {

    const team = await Team.findOne({
        where: {
            id: id
        }
    });

    return team?.dataValues;
}



export const delete_team_by_id = async ({ id }: { id: string }) => {

    const team = await TeamModel.findOne({
        where: {
            id: id
        }
    });

    if (!team) throw new CustomError("Team not found", 404);

    const teamData = team?.dataValues;

    team?.destroy();

    return team;
}
