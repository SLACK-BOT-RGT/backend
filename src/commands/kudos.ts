import { AckFn, RespondArguments, RespondFn, SlashCommand } from "@slack/bolt";
import { Op } from "sequelize";
import { TeamMemberModel } from "../model";
import { WebClient } from "@slack/web-api";
import Kudos from "../model/kudos";
import TeamModel from "../model/team";
import User from "../model/user";

interface CommandProps {
    command: SlashCommand;
    ack: AckFn<string | RespondArguments>;
    respond: RespondFn;
    client: WebClient;
}

const KUDOS_TYPES = [
    { text: "🚀 Rocket (3 points)", value: "rocket" },
    { text: "❤️ Heart (2 points)", value: "heart" },
    { text: "👍 Thumbs Up (1 point)", value: "thumbs" }
];

export const GiveKudos = async ({ command, ack, respond, client }: CommandProps) => {
    try {
        await ack();
        const userId = command.user_id;
        const team = await TeamModel.findOne({ where: { name: command.text.trim() } });

        if (!team) {
            return respond(`Team *${command.text}* not found.`);
        }

        // Fetch all team members
        const members = await TeamMemberModel.findAll({ where: { team_id: team.id }, include: [User] });
        if (!members.length) {
            return respond("No team members found.");
        }

        // Check how many kudos the user has given today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const kudosGiven = await Kudos.count({
            where: {
                from_user_id: userId,
                created_at: { [Op.gte]: today }
            }
        });

        if (kudosGiven >= 3) {
            return respond("⚠️ You have reached your 3 kudos limit for today.");
        }

        console.log('====================================');
        // console.log(members.);
        console.log('====================================');
        // Create a dropdown with all team members
        const memberOptions: { text: { type: "plain_text"; text: string; emoji: boolean }; value: string }[] =
            members.map(member => {
                const user = (member as any).User;
                return {
                    text: {
                        type: "plain_text",  // Explicitly set type
                        text: user?.name || "Unknown",
                        emoji: true
                    },
                    value: user?.id || "Unknown"
                };
            });

        await client.views.open({
            trigger_id: command.trigger_id,
            view: {
                type: "modal",
                callback_id: "submit_kudos",
                private_metadata: JSON.stringify({ team_id: team.id, from_user_id: userId }),
                title: { type: "plain_text", text: "Give Kudos" },

                // close: { type: "plain_text", text: "Cancel" },
                blocks: [
                    {
                        type: "section",
                        block_id: "selected_member",
                        text: {
                            type: "mrkdwn",
                            text: "Pick an item from the dropdown list"
                        },
                        accessory: {
                            type: "static_select",
                            placeholder: {
                                type: "plain_text",
                                text: "Select an item",
                                emoji: true
                            },
                            options: memberOptions,
                            action_id: "static_selected_member"
                        }
                    },
                    {
                        type: "input",
                        block_id: "kudos_type_block",
                        element: {
                            type: "radio_buttons",
                            action_id: "kudos_type",
                            options: KUDOS_TYPES.map(type => ({
                                text: { type: "plain_text", text: type.text },
                                value: type.value
                            }))
                        },
                        label: { type: "plain_text", text: "Kudos Type" }
                    },
                    {
                        type: "input",
                        block_id: "message_block",
                        element: {
                            type: "plain_text_input",
                            action_id: "message",
                            multiline: true
                        },
                        label: { type: "plain_text", text: "Why are you giving kudos?" }
                    }
                ],
                submit: {
                    type: 'plain_text',
                    text: 'Submit',
                },
            }
        });
    } catch (error) {
        console.error("Error opening kudos modal:", error);
        await respond("Failed to start kudos process. Please try again.");
    }
};
