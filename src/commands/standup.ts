// src/commands/standup.ts
import { AckFn, RespondArguments, RespondFn, SlashCommand } from "@slack/bolt";
import { Op } from 'sequelize';
import { StandupConfigsModel, StandupResponseModel } from '../model';
import { WebClient } from "@slack/web-api";
import Team from '../model/team';
import TeamModel from "../model/team";
import UserModel from "../model/user";

interface commandProps {
    command: SlashCommand;
    ack: AckFn<string | RespondArguments>;
    respond: RespondFn;
    client: WebClient;
}

export const StartStandup = async ({ command, ack, respond, client }: commandProps) => {
    await ack();
    try {
        const [teamName] = command.text.split(" ");
        // Get team config
        const team = await TeamModel.findOne({ where: { name: teamName } });

        const teamConfig = await StandupConfigsModel.findOne({
            where: {
                team_id: team?.id,
                is_active: true
            },
            include: [{
                model: Team
            }],
        });

        if (!teamConfig) {
            await respond("No active standup configuration found for this team.");
            return;
        }

        // Check if standup already started today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingStandup = await StandupResponseModel.findOne({
            where: {
                config_id: teamConfig.id,
                user_id: command.user_id,
                submitted_at: {
                    [Op.gte]: today
                }
            }
        });

        if (existingStandup) {
            await respond("Today's standup has already been started!");
            return;
        }

        // Create blocks for standup questions
        const blocks = [
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: "🌅 Time for daily standup!"
                }
            },
            {
                type: "divider"
            },
        ];

        // Add each question as a block
        teamConfig.questions?.forEach((question: string, index: number) => {
            blocks.push({
                type: "input",
                block_id: `question_${index}`,
                label: {
                    type: "plain_text",
                    text: question
                },
                element: {
                    type: "plain_text_input",
                    action_id: `response_${index}`,
                    multiline: true
                }
            } as any);
        });

        // Open modal for standup response
        await client.views.open({
            trigger_id: command.trigger_id,
            view: {
                type: "modal",
                callback_id: "standup_response_modal",
                private_metadata: JSON.stringify({ team_id: team?.id }),
                title: {
                    type: "plain_text",
                    text: "Daily Standup"
                },
                submit: {
                    type: "plain_text",
                    text: "Submit"
                },
                blocks: blocks
            }
        });

    } catch (error) {
        console.error('Error starting standup:', error);
        await respond("Failed to start standup. Please try again.");
    }
};

export const SkipStandup = async ({ command, ack, respond }: commandProps) => {
    await ack();
    try {
        const [teamName, ...reasonArray] = command.text.split(" ");
        const reasons = reasonArray.join(" ").split(";").map((q) => q.trim());

        const team = await TeamModel.findOne({ where: { name: teamName } });
        const teamConfig = await StandupConfigsModel.findOne({
            where: {
                team_id: team?.id,
                is_active: true
            }
        });

        if (!teamConfig) {
            await respond("No active standup configuration found.");
            return;
        }

        // Check if standup already started today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingStandup = await StandupResponseModel.findOne({
            where: {
                config_id: teamConfig.id,
                user_id: command.user_id,
                submitted_at: {
                    [Op.gte]: today
                }
            }
        });

        if (existingStandup) {
            await respond("Today's standup has already been started!");
            return;
        }

        // Record skip response
        await StandupResponseModel.create({
            user_id: command.user_id,
            config_id: teamConfig.id,
            responses: { skipped: true, reason: reasons },
            submitted_at: new Date()
        });

        await respond(`<@${command.user_id}> has skipped today's standup.`);
    } catch (error) {
        console.error('Error skipping standup:', error);
        await respond("Failed to record standup skip. Please try again.");
    }
};

export const ViewTodayStandups = async ({ command, client, ack, respond }: commandProps) => {
    await ack();
    try {
        const [teamName] = command.text.split(" ");

        const team = await TeamModel.findOne({ where: { name: teamName } });
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!team) {
            await respond("Team not found, check the name and try again!");
            return;
        }

        const teamConfig = await StandupConfigsModel.findOne({
            where: {
                team_id: team?.id,
                is_active: true
            }
        });

        if (!teamConfig) {
            await respond("No active standup configuration found.");
            return;
        }

        const responses = await StandupResponseModel.findAll({
            where: {
                config_id: teamConfig.id,
                submitted_at: {
                    [Op.gte]: today
                }
            },
            include: [{
                model: UserModel
            }],
        });

        // Format responses
        const blocks = [
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `📊 *Today's Standup Responses for #${team.name}*`
                }
            },
            {
                type: "divider"
            }
        ];

        for (const response of responses as (StandupResponseModel & { User: UserModel })[]) {
            if (response.responses.skipped) {
                blocks.push({
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `*-${response.User.name}*\n_Skipped_ - ${response.responses.reason || 'No reason provided'}`
                    }
                });
            } else {
                const responseText = teamConfig.questions?.map((q: string, i: number) => {
                    return `*${q}*\n${response.responses[`response_${i}`]}`;
                }).join('\n\n');

                blocks.push({
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `*@${response.User.name}*\n${responseText}`
                    }
                });
            }
            blocks.push({
                type: "divider"
            });
        }

        await client.chat.postMessage({
            channel: command.user_id,
            blocks: blocks
        });

    } catch (error) {
        console.error('Error viewing standups:', error);
        await respond("Failed to retrieve today's standups. Please try again.");
    }
};