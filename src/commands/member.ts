import { AckFn, RespondArguments, RespondFn, SlashCommand } from "@slack/bolt";
import TeamModel from "../model/team";
import TeamMemberModel from "../model/teamMember";
import UserModel from "../model/user";

interface commandProps {
    command: SlashCommand;
    ack: AckFn<string | RespondArguments>;
    respond: RespondFn;
}

export const AddMember = async ({ command, ack, respond }: commandProps) => {
    await ack();
    const [teamName, userEmail, role] = command.text.split(" ");

    if (!teamName || !userEmail || !role) {
        return respond("Usage: `/add-member [team_name] [user_email] [role]`");
    }

    try {
        const team = await TeamModel.findOne({ where: { name: teamName } });
        if (!team) {
            return respond(`Team "${teamName}" does not exist.`);
        }

        const user = await UserModel.findOne({ where: { email: userEmail } });
        if (!user) {
            return respond(`User with email "${userEmail}" does not exist.`);
        }

        const existingMember = await TeamMemberModel.findOne({
            where: { team_id: team.id, user_id: user.id },
        });
        if (existingMember) {
            return respond(`User "${userEmail}" is already a member of team "${teamName}".`);
        }

        await TeamMemberModel.create({ team_id: team.id, user_id: user.id, role });

        respond(`User "${userEmail}" added to team "${teamName}" as "${role}".`);
    } catch (error) {
        console.error("Error adding member:", error);
        respond("Failed to add member. Please try again.");
    }
};

export const RemoveMember = async ({ command, ack, respond }: commandProps) => {
    await ack();
    const [teamName, userEmail] = command.text.split(" ");

    if (!teamName || !userEmail) {
        return respond("Usage: `/remove-member [team_name] [user_email]`");
    }

    try {
        const team = await TeamModel.findOne({ where: { name: teamName } });
        if (!team) {
            return respond(`Team "${teamName}" does not exist.`);
        }

        const user = await UserModel.findOne({ where: { email: userEmail } });
        if (!user) {
            return respond(`User with email "${userEmail}" does not exist.`);
        }

        const teamMember = await TeamMemberModel.findOne({
            where: { team_id: team.id, user_id: user.id },
        });
        if (!teamMember) {
            return respond(`User "${userEmail}" is not a member of team "${teamName}".`);
        }

        await TeamMemberModel.destroy({ where: { team_id: team.id, user_id: user.id } });

        respond(`User "${userEmail}" has been removed from team "${teamName}".`);
    } catch (error) {
        console.error("Error removing member:", error);
        respond("Failed to remove member. Please try again.");
    }
};
