import { TeamModel } from "../../model";

export const createTeamModal = async (userId: string, client: any, triggerId: string) => {


    const result = await client.views.open({
        trigger_id: triggerId,
        view: {
            "type": "modal",
            "callback_id": 'create_team_modal',
            "submit": {
                "type": "plain_text",
                "text": "Submit",
                "emoji": true
            },
            "close": {
                "type": "plain_text",
                "text": "Cancel",
                "emoji": true
            },
            "title": {
                "type": "plain_text",
                "text": "Create a team/channel",
                "emoji": true
            },
            "blocks": [
                {
                    "type": "input",
                    "block_id": "name",
                    "label": {
                        "type": "plain_text",
                        "text": "Name",
                        "emoji": true
                    },
                    "element": {
                        "type": "plain_text_input",
                        "action_id": "input",
                        "multiline": false
                    }
                },
                {
                    "type": "input",
                    "block_id": "description",
                    "label": {
                        "type": "plain_text",
                        "text": "Description",
                        "emoji": true
                    },
                    "element": {
                        "type": "plain_text_input",
                        "action_id": "input",
                        "multiline": true
                    },
                    "optional": true
                }
            ]
        }
    });

    if (!result.ok) {
        console.error('Error opening the modal:', result.error);
    }
};


export const removeTeamModal = async (userId: string, client: any, triggerId: string) => {
    try {
        // Fetch teams from the database
        const teams = await TeamModel.findAll(); // Adjust based on your ORM (e.g., Sequelize)

        if (!teams || teams.length === 0) {
            return client.chat.postEphemeral({
                channel: userId,
                text: "No teams available to remove.",
                user: userId,
            });
        }

        // Map teams to Slack modal options format
        const teamOptions = teams.map((team) => ({
            text: {
                type: "plain_text",
                text: team.name,
            },
            value: team.id.toString(), // Use team ID or a unique identifier
        }));

        // Open the modal
        const result = await client.views.open({
            trigger_id: triggerId,
            view: {
                type: "modal",
                callback_id: "remove_team_modal",
                submit: {
                    type: "plain_text",
                    text: "Submit",
                    emoji: true,
                },
                close: {
                    type: "plain_text",
                    text: "Cancel",
                    emoji: true,
                },
                title: {
                    type: "plain_text",
                    text: "Remove Team",
                    emoji: true,
                },
                blocks: [
                    {
                        type: "input",
                        block_id: "team_selection", // Unique identifier for this block
                        element: {
                            type: "multi_static_select", // Allows multi-selection
                            action_id: "selected_teams", // Identifier for this input
                            placeholder: {
                                type: "plain_text",
                                text: "Select teams to delete",
                            },
                            options: teamOptions, // Dynamically generated options
                        },
                        label: {
                            type: "plain_text",
                            text: "Teams",
                        },
                    },
                ],
            },
        });

        if (!result.ok) {
            console.error("Error opening the modal:", result.error);
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
