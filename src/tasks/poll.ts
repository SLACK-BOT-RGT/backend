import { WebClient } from "@slack/web-api";
import { get_poll_by_id } from "../services/polls";
import { get_team_by_id } from "../services/team";
import { IPoll, IPollOption, IUser } from "../types/interfaces";
import { get_user_by_id } from "../services/users";

// Initialize Slack client
const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

export async function sendPollToChannel(pollId: string) {
    try {
        // 1. Fetch poll from database
        const poll: IPoll = await get_poll_by_id({ id: pollId });
        if (!poll) {
            throw new Error('Poll not found');
        }

        const creator: IUser = await get_user_by_id({ id: poll.creator_id });

        // 2. Get team's Slack channel from database
        const team = await get_team_by_id({ id: poll.team_id });
        if (!team || !team.id) {
            throw new Error('Team or channel not found');
        }

        // 3. Format poll for Slack
        const pollMessage = {
            channel: team.id,
            text: poll.question, // Fallback text
            blocks: [
                {
                    type: "header",
                    text: {
                        type: "plain_text",
                        text: `📊 ${poll.question}`,
                        emoji: true
                    }
                },
                ...poll.options.map((option: IPollOption, index: number) => ({
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `*${option.id}.* ${option.text}`
                    },
                    accessory: {
                        type: "button",
                        text: {
                            type: "plain_text",
                            text: "Vote",
                            emoji: true
                        },
                        value: option.id?.toString(),
                        action_id: `vote_${index}`
                    }
                })),
                {
                    type: "context",
                    elements: [
                        {
                            type: "mrkdwn",
                            text: `Poll created by <@${creator.name}>`
                        }
                    ]
                }
            ]
        };

        // 4. Send poll to Slack
        const response = await slack.chat.postMessage(pollMessage);

        console.log('====================================');
        console.log("response=>", response);
        console.log('====================================');
        return response;
    } catch (error) {
        console.error('Error sending poll:', error);
        throw error;
    }
}


// Helper function to format duration
function formatDuration(endTime: any) {
    const hours = Math.ceil((new Date(endTime).getTime() - new Date().getTime()) / (1000 * 60 * 60));
    return hours >= 24
        ? `${Math.floor(hours / 24)} days`
        : `${hours} hours`;
}


// Example usage:
// sendPollToChannel('poll_123')
//   .then(result => console.log('Poll sent successfully'))
//   .catch(error => console.error('Failed to send poll:', error));