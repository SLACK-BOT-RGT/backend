import { StandupResponseModel, TeamMemberModel } from "../model"
import StandupResponse from "../model/standupResponse";
import User from "../model/user";
import { CustomError } from "../utils/CustomError";
import { Op } from 'sequelize';

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


export const get_team_members_today_status = async ({ team_id }: { team_id: string }) => {
    try {
        // Fetch team members and associated user details
        const team_members = await TeamMemberModel.findAll({
            where: { team_id: team_id },
            include: [{ model: User }],
        });

        // Get the current date and reset time to the start of the day
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        console.log("Fetching team members' status for today...");

        // Map team members and fetch their standup status for today
        const data = await Promise.all(
            team_members.map(async (member) => {
                const existingStandup = await StandupResponseModel.findOne({
                    where: {
                        user_id: member.user_id,
                        submitted_at: { [Op.gte]: today },
                    },
                });

                return {
                    name: member.dataValues.User.name,
                    status: existingStandup ? "Responded" : "Missed",
                    time: existingStandup?.dataValues.submitted_at || "-",
                };
            })
        );

        return data;
    } catch (error) {
        console.error("Error fetching team members' status:", error);
        throw new Error("Failed to fetch team members' status.");
    }
};

export const get_team_members_week_status = async ({ team_id }: { team_id: string }) => {
    try {
        // Fetch team members and associated user details
        const team_members = await TeamMemberModel.findAll({
            where: { team_id: team_id },
            include: [{ model: User }],
        });

        // Get the current date and reset time to the start of the day
        // const today = new Date();
        // today.setHours(0, 0, 0, 0);

        console.log("Fetching team members' status for today...");

        // Map team members and fetch their standup status for today
        const data = await Promise.all(
            team_members.map(async (member) => {
                const existingStandup = await StandupResponseModel.findOne({
                    where: {
                        user_id: member.user_id,
                        // submitted_at: { [Op.gte]: today },
                    },
                });

                return {
                    name: member.dataValues.User.name,
                    status: existingStandup ? "Responded" : "Missed",
                    time: existingStandup?.dataValues.submitted_at || "-",
                };
            })
        );

        return data;
    } catch (error) {
        console.error("Error fetching team members' status:", error);
        throw new Error("Failed to fetch team members' status.");
    }
};
