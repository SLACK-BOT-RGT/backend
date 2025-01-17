import { AckFn, RespondArguments, RespondFn, SlashCommand } from "@slack/bolt";
import TeamModel from "../model/team";
import TeamMemberModel from "../model/teamMember";
import UserModel from "../model/user";
import { WebClient } from "@slack/web-api";

interface commandProps {
    command: SlashCommand;
    ack: AckFn<string | RespondArguments>;
    respond: RespondFn;
    client: WebClient;
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


export const InviteUserToChannel = async ({ command, ack, respond, client }: commandProps) => {
    await ack();
    const [channelName, userEmail] = command.text.split(" ");

    if (!channelName || !userEmail) {
        return respond("Usage: `/invite-user [channel_name] [user_email]`");
    }

    try {
        // Fetch user info by email
        const userList = await client.users.list({});
        const user = userList.members?.find((member) => member.profile?.email === userEmail);

        if (!user || !user.id) {
            return respond(`User with email "${userEmail}" not found on Slack.`);
        }

        // Fetch channel info
        const channelList = await client.conversations.list();
        const channel = channelList.channels?.find((ch) => ch.name === channelName);

        if (!channel || !channel.id) {
            return respond(`Channel "#${channelName}" not found.`);
        }

        // Invite user to channel
        await client.conversations.invite({ channel: channel.id, users: user.id });

        respond(`User "${userEmail}" has been invited to channel "#${channelName}".`);
    } catch (error) {
        console.error("Error inviting user to channel:", error);
        respond("Failed to invite user. Please try again.");
    }
};


export const RemoveUserFromChannel = async ({ command, ack, respond, client }: commandProps) => {
    await ack();
    const [channelName, userEmail] = command.text.split(" ");

    if (!channelName || !userEmail) {
        return respond("Usage: `/remove-user [channel_name] [user_email]`");
    }

    try {
        // Fetch user info by email
        const userList = await client.users.list({});
        const user = userList.members?.find((member) => member.profile?.email === userEmail);

        if (!user || !user.id) {
            return respond(`User with email "${userEmail}" not found on Slack.`);
        }

        // Fetch channel info
        const channelList = await client.conversations.list();
        const channel = channelList.channels?.find((ch) => ch.name === channelName);

        if (!channel || !channel.id) {
            return respond(`Channel "#${channelName}" not found.`);
        }

        // Remove user from channel
        await client.conversations.kick({ channel: channel.id, user: user.id });

        respond(`User "${userEmail}" has been removed from channel "#${channelName}".`);
    } catch (error) {
        console.error("Error removing user from channel:", error);
        respond("Failed to remove user. Please try again.");
    }
};


export const ListAllUsers = async ({ command, ack, respond, client }: commandProps) => {
    await ack();

    try {
        // Fetch all users
        const userList = await client.users.list({});
        const members = userList.members;

        if (!members || members.length === 0) {
            return respond("No users found in the workspace.");
        }

        // Format user details
        const userDetails = members
            .filter((member) => !member.is_bot && !member.deleted) // Exclude bots and deactivated users
            .map((user) => `- ${user.profile?.real_name || user.name} (${user.profile?.email || "No email"})`)
            .join("\n");

        // Respond with the list of users
        respond(`Here is the list of all users:\n${userDetails}`);
    } catch (error) {
        console.error("Error fetching user list:", error);
        respond("Failed to fetch user list. Please try again.");
    }
};


