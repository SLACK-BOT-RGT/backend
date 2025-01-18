import { TeamMemberModel, UserModel } from "../model"
import { IUser } from "../types/interfaces"
import { ITeamMember } from "../types/interfaces_team_member";
import { CustomError } from "../utils/CustomError";

export const create_team_member = async (teamMemberData: ITeamMember) => {

    const { email, name, timeZone, id } = teamMemberData;

    const team = await TeamMemberModel.create({ email, name, timeZone, id });

    return team.dataValues;
}

export const get_all_teams_members = async () => {

    const team_members = await TeamMemberModel.findAll();

    return team_members;
}

export const get_team_member_by_email = async ({ email }: { email: string }) => {

    const team_member = await TeamMemberModel.findOne({
        where: {
            email: email
        }
    });

    return team_member?.dataValues;
}

export const get_team_member_by_id = async ({ id }: { id: string }) => {

    const team_member = await TeamMemberModel.findOne({
        where: {
            id: id
        }
    });

    return team_member?.dataValues;
}

export const delete_team_member_by_id = async ({ id }: { id: string }) => {

    const team_member = await TeamMemberModel.findOne({
        where: {
            id: id
        }
    });

    if (!team_member) throw new CustomError("Team Member not found", 404);

    const team_MemberData = team_member?.dataValues;

    team_member?.destroy();

    return team_MemberData;
}