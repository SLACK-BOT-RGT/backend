import { AckFn, RespondFn, SlackViewAction, ViewOutput, ViewResponseAction } from "@slack/bolt";
import { Logger, WebClient } from "@slack/web-api";
import { TeamMemberModel, TeamModel, UserModel } from "../model";

interface ModalSubmissionProps {
    ack: AckFn<void> | AckFn<ViewResponseAction>;
    body: SlackViewAction;
    view: ViewOutput;
    client: WebClient;
    logger: Logger;
    respond: RespondFn;
}

export const AddTeamMemberModalSubmission = async ({ ack, body, view, client, logger }: ModalSubmissionProps) => {
    // Acknowledge the submission
    await ack();

    // Extract the input data
    const userId = body.user.id;
    const selected_team = view.state.values['team_selection']['selected_teams'].selected_option;
    const selected_members = view.state.values['member_selection']['selected_members'].selected_options || [];

    try {
        const teamId = selected_team?.value; // Team ID
        const teamName = selected_team?.text.text as string; // Team name

        // Fetch the team details from the database
        const team = await TeamModel.findOne({ where: { id: teamId } });
        if (!team) {
            throw new Error(`Team "${teamName}" does not exist in the database.`);
        }

        const channelList = await client.conversations.list();
        const slackChannel = channelList.channels?.find(
            (ch) => ch.name === teamName
        );

        const channelId = slackChannel?.id;

        // Check if the channel ID exists
        if (!channelId) {
            throw new Error(`Channel for team "${teamName}" does not exist or is not linked in the database.`);
        }

        // Iterate over the selected members and invite them to the channel
        for (const member of selected_members) {
            const memberEmail = member.value;

            // Fetch the user by email
            const userResponse = await client.users.lookupByEmail({ email: memberEmail });
            if (!userResponse.ok) {
                logger.warn(`User with email "${memberEmail}" not found.`);
                continue;
            }

            const userId = userResponse.user?.id;

            // Invite the user to the channel
            await client.conversations.invite({
                channel: channelId,
                users: userId as string,
            });

            logger.info(`User "${memberEmail}" successfully invited to channel "${teamName}".`);
            const userData = await UserModel.findOne({ where: { id: userId } });

            if (!userData) {
                await UserModel.create({
                    id: userId,
                    name: userResponse.user?.name,
                    email: memberEmail
                });
            }

            //     // Add the user to the database as a team member
            await TeamMemberModel.create({
                team_id: teamId,
                // user_email: memberEmail,
                user_id: userId,
                role: 'member'
            });

        }

        // // Respond with success message
        await client.chat.postMessage({
            channel: userId,
            text: `Selected members have been successfully added to the team "${teamName}".`,
        });

    } catch (error) {
        logger.error("Error adding team members:", error);

        // Respond with failure message
        await client.chat.postMessage({
            channel: userId,
            text: `An error occurred while adding members to the team. Please try again.`,
        });
    }
};

export const RemoveTeamMemberModalSubmission = async ({ ack, body, view, client, logger }: ModalSubmissionProps) => {
    // Acknowledge the submission
    await ack();

    // Extract the input data
    const userId = body.user.id;
    const selectedTeam = view.state.values['team_selection']['selected_teams'].selected_option?.value; // Channel ID
    const selectedMembers = view.state.values['member_selection']['selected_members'].selected_options || []; // Members to remove

    try {
        if (!selectedTeam) {
            throw new Error("No channel selected.");
        }

        if (selectedMembers.length === 0) {
            throw new Error("No members selected.");
        }

        // Remove members from the channel and update the database
        for (const member of selectedMembers) {
            const userEmail = member.value;

            // Fetch user ID from email
            const userList = await client.users.lookupByEmail({ email: userEmail });
            const memberId = userList?.user?.id;

            if (!memberId) {
                logger.error(`Could not find user ID for email: ${userEmail}`);
                continue;
            }

            // Remove the user from the channel
            await client.conversations.kick({
                channel: selectedTeam,
                user: memberId,
            });

            logger.info(`Successfully removed user ${userEmail} from channel ${selectedTeam}`);

            // Remove the user from the team in the database
            await TeamMemberModel.destroy({
                where: {
                    team_id: selectedTeam,
                    user_id: memberId,
                }
            });

            logger.info(`Successfully removed user ${userEmail} from database for team ${selectedTeam}`);
        }

        // Notify the user about the success
        await client.chat.postEphemeral({
            channel: userId,
            text: `Selected members have been successfully removed from the channel and the database.`,
            user: userId,
        });

    } catch (error) {
        logger.error("Error removing team members:", error);

        // Notify the user about the error
        await client.chat.postEphemeral({
            channel: userId,
            text: `An error occurred while removing members. Please try again.`,
            user: userId,
        });
    }
};
