import { WebClient } from "@slack/web-api";
import { AckFn, RespondArguments, RespondFn, SlashCommand } from "@slack/bolt";
import TeamModel from "../model/team";
import StandupConfigsModel from "../model/standupConfigs";
import { create_team } from "../services/team";
import { TeamMemberModel } from "../model";

interface commandProps {
    command: SlashCommand;
    ack: AckFn<string | RespondArguments>;
    respond: RespondFn;
    client: WebClient
}

export const AddTeam = async ({ command, ack, respond, client }: commandProps) => {
    await ack();
    const allChannels = await client.conversations.list();
    console.log("Avaliable channels=>", allChannels.channels?.map((channel) => channel.name));

    const [name, description] = command.text.split(" ");
    if (!name || !description) {
        return respond("Usage: `/add-team [name] [description]`");
    }

    try {
        // Create the team in the database
        // const team = await TeamModel.create({ name, description });


        // Create a Slack channel with the team name
        const channelResponse = await client.conversations.create({
            name: name.toLowerCase().replace(/\s+/g, "-"), // Slack requires lowercase and hyphen-separated names
            is_private: false,
        });

        if (channelResponse.ok && channelResponse.channel?.id) {
            const channelId = channelResponse.channel.id;

            await create_team({ id: channelId, name, description });

            // Ensure the bot joins the channel
            // await client.conversations.join({ channel: channelId });

            // Invite the user to the channel (replace with the actual user's Slack ID)
            const userSlackId = command.user_id;
            await client.conversations.invite({
                channel: channelId,
                users: userSlackId,
            });

            respond(
                `Team "${name}" created successfully. Slack channel "#${name}" has also been created, and you have been added to the channel.`
            );
        } else {
            respond(
                "Team creation succeeded, but the Slack channel could not be created. Please try again."
            );
        }
    } catch (error) {
        console.error("Error creating team:", error);
        respond("Failed to create team. Please try again.");
    }
};

export const RemoveTeam = async ({ command, ack, respond, client }: commandProps) => {
    await ack();
    const teamName = command.text.trim();

    if (!teamName) {
        return respond("Usage: `/remove-team [team_name]`");
    }

    try {
        // Find the team in the database
        const team = await TeamModel.findOne({ where: { name: teamName } });
        if (!team) {
            return respond(`Team "${teamName}" does not exist.`);
        }

        // Archive the associated Slack channel
        const channelName = teamName.toLowerCase().replace(/\s+/g, "-");
        const channelList = await client.conversations.list();

        const slackChannel = channelList.channels?.find(
            (ch) => ch.name === channelName
        );

        if (slackChannel && slackChannel.id) {
            await client.conversations.archive({ channel: slackChannel.id });
        } else {
            console.warn(`Channel "#${channelName}" not found on Slack.`);
        }

        // Delete associated team members
        await TeamMemberModel.destroy({ where: { team_id: team.id } });

        // Delete the team itself
        await team.destroy();

        respond(
            `Team "${teamName}" and its members have been removed successfully. Slack channel "#${channelName}" has been archived.`
        );
    } catch (error) {
        console.error("Error removing team:", error);
        respond("Failed to remove team. Please try again.");
    }
};

export const SetQuestions = async ({ command, ack, respond }: commandProps) => {
    await ack();
    const [teamName, ...questionsArray] = command.text.split(" ");
    const questions = questionsArray.join(" ").split(";").map((q) => q.trim());

    if (!teamName || questions.length === 0) {
        return respond(
            "Usage: `/set-questions [team_name] [question1]; [question2]; [question3]`"
        );
    }

    try {
        const team = await TeamModel.findOne({ where: { name: teamName } });
        if (!team) {
            return respond(`Team "${teamName}" does not exist.`);
        }

        let config = await StandupConfigsModel.findOne({ where: { team_id: team.id } });
        if (!config) {
            config = await StandupConfigsModel.create({ team_id: team.id });
        }

        config.questions = questions;
        await config.save();

        respond(`Standup questions for team "${teamName}" have been set successfully.`);
    } catch (error) {
        console.error("Error setting questions:", error);
        respond("Failed to set questions. Please try again.");
    }
};


export const SetReminder = async ({ command, ack, respond }: commandProps) => {
    await ack();
    const [teamName, time, due_time, ...daysArray] = command.text.split(" ");
    const days = daysArray.join(" ").split(",").map((day) => day.trim().toLowerCase());

    if (!teamName || !time || !due_time || days.length === 0) {
        return respond(
            "Usage: `/set-reminder [team_name] [time_in_HH:MM] [days_comma_separated]`"
        );
    }

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(time) || !timeRegex.test(due_time)) {
        return respond("Invalid time format. Use HH:MM in 24-hour format.");
    }

    const validDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    if (!days.every((day) => validDays.includes(day))) {
        return respond(`Invalid days provided. Use a comma-separated list of days (e.g., monday,tuesday).`);
    }

    try {
        const team = await TeamModel.findOne({ where: { name: teamName } });
        if (!team) {
            return respond(`Team "${teamName}" does not exist.`);
        }

        let config = await StandupConfigsModel.findOne({ where: { team_id: team.id } });
        if (!config) {
            config = await StandupConfigsModel.create({ team_id: team.id });
        }

        config.reminder_time = time;
        config.due_time = due_time;
        config.reminder_days = days;
        await config.save();

        respond(`Reminder for team "${teamName}" has been set at ${time} on ${days.join(", ")}.`);
    } catch (error) {
        console.error("Error setting reminder:", error);
        respond("Failed to set reminder. Please try again.");
    }
};
