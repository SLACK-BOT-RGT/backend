import { WebClient } from "@slack/web-api";
import { AckFn, RespondArguments, RespondFn, SlashCommand } from "@slack/bolt";
import TeamModel from "../model/team";
import TeamMemberModel from "../model/teamMember";

interface commandProps {
    command: SlashCommand;
    ack: AckFn<string | RespondArguments>;
    respond: RespondFn;
}

const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);


export const AddTeam = async ({ command, ack, respond }: commandProps) => {
    await ack();
    const allChannels = await slackClient.conversations.list();
    console.log("Avaliable channels=>", allChannels.channels?.map((channel) => channel.name));

    const [name, timeZone] = command.text.split(" ");
    if (!name || !timeZone) {
        return respond("Usage: `/add-team [name] [timezone]`");
    }

    try {
        // Create the team in the database
        const team = await TeamModel.create({ name, timeZone });

        // Create a Slack channel with the team name
        const channelResponse = await slackClient.conversations.create({
            name: name.toLowerCase().replace(/\s+/g, "-"), // Slack requires lowercase and hyphen-separated names
            is_private: false,
        });

        if (!channelResponse.ok) {
            console.error("Slack channel creation failed:", channelResponse.error);
            return respond(
                `Team "${name}" created successfully in the database, but Slack channel creation failed.`
            );
        }

        respond(
            `Team "${name}" created successfully. Slack channel "#${name.toLowerCase().replace(
                /\s+/g,
                "-"
            )}" has also been created.`
        );
    } catch (error) {
        console.error("Error creating team:", error);
        respond("Failed to create team. Please try again.");
    }
};


export const RemoveTeam = async ({ command, ack, respond }: commandProps) => {
    await ack();
    const teamName = command.text.trim();

    if (!teamName) {
        return respond("Usage: `/remove-team [team_name]`");
    }

    try {
        const team = await TeamModel.findOne({ where: { name: teamName } });
        if (!team) {
            return respond(`Team "${teamName}" does not exist.`);
        }

        // Delete associated team members
        await TeamMemberModel.destroy({ where: { team_id: team.id } });

        // Delete the team itself
        await team.destroy();

        respond(`Team "${teamName}" and its members have been removed successfully.`);
    } catch (error) {
        console.error("Error removing team:", error);
        respond("Failed to remove team. Please try again.");
    }
};
