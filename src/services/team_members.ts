import { TeamMemberModel } from "../model"
import User from "../model/user";
import { CustomError } from "../utils/CustomError";

interface createTeamMemberProps {
    role: string;
    user_id: string
    team_id: string
}

export const create_team_member = async (teamMemberData: createTeamMemberProps) => {

    const { role, user_id, team_id } = teamMemberData;

    const team = await TeamMemberModel.create({ team_id, role, user_id });

    return team.dataValues;
}

export const get_all_teams_members = async () => {

    const team_members = await TeamMemberModel.findAll({
        include: [{
            model: User
        }],
    });

    return team_members;
}

export const get_team_member_by_id = async ({ id }: { id: string }) => {

    const team_member = await TeamMemberModel.findOne({
        where: {
            id: id
        }
    });

    return team_member?.dataValues;
}

export const update_team_member = async ({ id, role }: { id: string, role: string }) => {

    const team_member = await TeamMemberModel.findByPk(id);

    if (!team_member) throw new CustomError(`Team member with id ${id} not found`, 404);

    await team_member.update({
        ...team_member.dataValues, role
    });

    return team_member?.dataValues;
}

export const delete_team_member_by_id = async ({ id }: { id: string }) => {

    const team_member = await TeamMemberModel.findByPk(id);

    if (!team_member) throw new CustomError("Team Member not found", 404);

    const team_MemberData = team_member?.dataValues;

    team_member?.destroy();

    return team_MemberData;
}