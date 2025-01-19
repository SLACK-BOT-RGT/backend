import { AckFn, RespondFn, SlackViewAction, ViewOutput, ViewResponseAction } from "@slack/bolt";
import { Logger, WebClient } from "@slack/web-api";
import { create_Team } from "../services/team";
import { TeamModel } from "../model";

interface CreateTeamModalSubmissionProps {
    ack: AckFn<void> | AckFn<ViewResponseAction>;
    body: SlackViewAction;
    view: ViewOutput;
    client: WebClient;
    logger: Logger;
    respond: RespondFn;
}

export const CreateTeamModalSubmission = async ({ ack, body, view, client, logger }: CreateTeamModalSubmissionProps) => {
    // Acknowledge the submission
    await ack();

    // Extract the input data
    const userId = body.user.id;
    const name = view.state.values['name']['input'].value || '';
    const description = view.state.values['description']['input'].value || ' ';

    try {

        // Create a Slack channel with the team name
        const channelResponse = await client.conversations.create({
            name: name.toLowerCase().replace(/\s+/g, "-"),
            is_private: false,
        });

        if (channelResponse.ok && channelResponse.channel?.id) {
            const channelId = channelResponse.channel.id;

            await create_Team({ id: channelId, name: name.toLowerCase().replace(/\s+/g, "-"), description });

            const userId = body.user.id;

            await client.conversations.invite({
                channel: channelId,
                users: userId,
            });

            await client.chat.postMessage({
                channel: userId,
                text: `Team "${name}" created successfully. Slack channel "#${name}" has also been created, and you have been added to the channel.`,
            });
        } else {
            await client.chat.postMessage({
                channel: userId,
                text: `Team creation succeeded, but the Slack channel could not be created. Please try again.`,
            });
        }
    } catch (error) {
        logger.error(error);
    }
}


export const RemoveTeamModalSubmission = async ({ ack, body, view, client, logger }: CreateTeamModalSubmissionProps) => {
    // Acknowledge the submission
    await ack();

    // Extract the input data
    const userId = body.user.id;
    const selected_teams = view.state.values['team_selection']['selected_teams'].selected_options || [];

    try {
        // Iterate over the selected teams
        for (const team of selected_teams) {
            const teamId = team.value; // Team ID
            const teamName = team.text.text; // Team name

            // Fetch the team from the database
            const teamData = await TeamModel.findOne({ where: { id: teamId } });
            if (!teamData) {
                logger.warn(`Team "${teamName}" does not exist in the database.`);
                continue;
            }

            // Attempt to archive/delete the Slack channel
            try {
                const channelList = await client.conversations.list();
                const slackChannel = channelList.channels?.find(
                    (ch) => ch.name === teamData.name
                );
                const channelId = slackChannel?.id;
                if (channelId) {
                    await client.conversations.archive({ channel: channelId });
                    logger.info(`Channel for team "${teamName}" archived successfully.`);
                } else {
                    logger.warn(`Channel ID not found for team "${teamName}".`);
                }
            } catch (slackError) {
                logger.error(`Error archiving channel for team "${teamName}":`, slackError);
            }

            // Delete the team members from the database
            // await TeamMemberModel.destroy({ where: { team_id: teamId } });

            // Delete the team itself from the database
            await TeamModel.destroy({ where: { id: teamId } });

            logger.info(`Team "${teamName}" and its members removed from the database.`);
        }

        // Respond with success message
        await client.chat.postMessage({
            channel: userId,
            text: "Selected teams and their associated channels have been removed successfully.",
        });
    } catch (error) {
        logger.error("Error processing team removal:", error);

        // Respond with failure message
        await client.chat.postMessage({
            channel: userId,
            text: `An error occurred while removing the selected teams. Please try again.`,
        });
    }
};
