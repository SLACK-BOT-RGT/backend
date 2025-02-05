import { StandupConfigsModel, StandupResponseModel, TeamMemberModel, TeamModel } from "../../model";
import { Op } from 'sequelize';

export const submitStandupModal = async (userId: string, client: any, triggerId: string) => {
    try {
        // Find all teams associated with the user
        const teamMembers = await TeamMemberModel.findAll({
            where: { user_id: userId },
            include: [TeamModel] // Automatically includes the team in the result
        });

        // Iterate over each team member and process their team
        for (const teamMember of teamMembers as any) {
            const team = teamMember.Team; // Access the associated TeamModel


            // Fetch the active configuration for the team
            const teamConfig = await StandupConfigsModel.findOne({
                where: {
                    team_id: team?.id,
                    is_active: true
                }
            });

            // If no active team configuration is found
            if (!teamConfig) {
                return client.chat.postEphemeral({
                    channel: userId,
                    text: "No active standup configuration found for this team.",
                    user: userId,
                });
            }

            // Check if standup has already started today
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset time to midnight for today

            const existingStandup = await StandupResponseModel.findOne({
                where: {
                    config_id: teamConfig.id,
                    user_id: userId,
                    status: {
                        [Op.or]: ['responded', 'missed'],
                    },
                    submitted_at: {
                        [Op.gte]: today
                    }
                }
            });

            if (existingStandup) {
                return client.chat.postEphemeral({
                    channel: userId,
                    text: "Today's standup has already been submitted or missed!",
                    user: userId,
                });
            }

            // Prepare the blocks for the standup modal
            const blocks = [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: "🌅 Time for daily standup!"
                    }
                },
                { type: "divider" },
                ...teamConfig?.questions?.map((question: string, index: number) => ({
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
                })) as any, // Dynamically add each question as a block
                {
                    type: "input",
                    block_id: "mood_tracking",
                    element: {
                        type: "radio_buttons",
                        options: [
                            {
                                text: {
                                    type: "plain_text",
                                    text: "😢 Unhappy",
                                },
                                value: "1",
                            },
                            {
                                text: {
                                    type: "plain_text",
                                    text: "😐 Neutral",
                                },
                                value: "2",
                            },
                            {
                                text: {
                                    type: "plain_text",
                                    text: "🙂 Happy",
                                },
                                value: "3",
                            },
                            {
                                text: {
                                    type: "plain_text",
                                    text: "😄 Very Happy",
                                },
                                value: "4",
                            },
                        ],
                        action_id: "mood_selection",
                    },
                    label: {
                        type: "plain_text",
                        text: "How is your mood today?",
                    },
                },
                {
                    type: "input",
                    block_id: "mood_reason",
                    element: {
                        type: "plain_text_input",
                        action_id: "mood_reason_input",
                        multiline: true,
                        placeholder: {
                            type: "plain_text",
                            text: "You can state the reasons for your mood here...",
                        },
                    },
                    label: {
                        type: "plain_text",
                        text: "Reason for your mood",
                    },
                    optional: true
                },
                {
                    type: "input",
                    block_id: "anonymous_option",
                    element: {
                        type: "checkboxes",
                        options: [
                            {
                                text: {
                                    type: "plain_text",
                                    text: "Submit mood anonymously",
                                },
                                value: "anonymous",
                            },
                        ],
                        action_id: "anonymous_selection",
                    },
                    label: {
                        type: "plain_text",
                        text: "Anonymity",
                    },
                    optional: true
                },
            ];

            // Open the modal for standup response
            await client.views.open({
                trigger_id: triggerId,
                view: {
                    type: "modal",
                    callback_id: "standup_response_modal",
                    private_metadata: JSON.stringify({ team_id: team?.id }), // Attach team ID in metadata
                    title: { type: "plain_text", text: "Daily Standup" },
                    submit: { type: "plain_text", text: "Submit" },
                    blocks: blocks
                }
            });
        }
    } catch (error) {
        console.error("Error fetching teams or opening the modal:", error);

        await client.chat.postEphemeral({
            channel: userId,
            text: "An error occurred while opening the modal. Please try again later.",
            user: userId,
        });
    }
};
