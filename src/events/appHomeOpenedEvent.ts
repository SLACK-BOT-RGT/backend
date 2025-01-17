import { WebClient } from "@slack/web-api";

export const openHomePageEvent = async ({ event, client }: { event: any; client: any }) => {
    try {

        await client.views.publish({
            user_id: event.user,
            view: {
                type: 'home',
                callback_id: 'home_view',
                blocks: [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": "*Welcome to the Daily Standup App* :wave:\nThis app helps you to easily track your daily updates, progress, and blockers. You can submit updates, view summaries, and change your previous updates."
                        }
                    },
                    {
                        "type": "divider"
                    },
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": "Choose an action to get started!"
                        }
                    },
                    {
                        "type": "actions",
                        "elements": [
                            {
                                "type": "button",
                                "text": {
                                    "type": "plain_text",
                                    "text": "Create team"
                                },
                                "action_id": "create_team"
                            },
                            {
                                "type": "button",
                                "text": {
                                    "type": "plain_text",
                                    "text": "Remove team"
                                },
                                "action_id": "remove_team"
                            },
                            {
                                "type": "button",
                                "text": {
                                    "type": "plain_text",
                                    "text": "Add team member"
                                },
                                "action_id": "add_team_member"
                            },
                            {
                                "type": "button",
                                "text": {
                                    "type": "plain_text",
                                    "text": "Remove team member"
                                },
                                "action_id": "remove_team_member"
                            }
                        ]
                    }
                ]
            }
        });
    } catch (error) {
        console.error(error);
    }
}