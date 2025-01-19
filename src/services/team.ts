import { TeamModel } from "../model";
import Team from "../model/team";
import { CustomError } from "../utils/CustomError";

interface createTeamProps {
    id: string;
    name: string;
    description: string;
}

export const create_Team = async ({ id, name, description }: createTeamProps) => {
    const team = await TeamModel.create({ id, name: name.toLowerCase().replace(/\s+/g, "-"), description });

    return team.dataValues;
}

export const get_all_teams = async () => {

    const teams = await TeamModel.findAll();

    return teams;
}

export const get_team_by_id = async ({ id }: { id: string }) => {

    const team = await Team.findOne({
        where: {
            id: id
        }
    });

    return team?.dataValues;
}

export const update_team_by_id = async ({ id, name, description }: { id: string; name: string; description: string }) => {

    const team = await Team.findByPk(id);

    if (!team) throw new CustomError(`Team with id ${id} not found`, 404);

    await team.update({
        name,
        description,
    });

    return team.dataValues;
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

    return teamData;
}
