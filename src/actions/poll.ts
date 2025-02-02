import { AckFn, BlockAction, DialogValidation, RespondFn, SayArguments, SlackAction } from "@slack/bolt";
import type { WebClient } from '@slack/web-api';
import { submitStandupModal } from "../user_interfaces/modals/standup";
import { get_team_polls, vote_on_poll } from "../services/polls";
import { IPoll } from "../types/interfaces";

export const VoteOnPollAction = async ({ body, ack, client, respond }: { body: any; ack: AckFn<void> | AckFn<string | SayArguments> | AckFn<DialogValidation>; client: WebClient, respond: RespondFn; }) => {
    await ack();

    const action = body.actions[0];
    try {
        const poll = await get_team_polls({ team_id: body.channel.id });
        const selectedPoll = poll.find((item) => item.question === body.message.text);
        const selectedOption = selectedPoll?.options.find((item) => item.id == action.value);

        if (!selectedPoll) return;
        if (!selectedOption) return;
        // Update poll with the user's vote
        const userId = body.user.id;

        // Store the user's vote in the database
        const updatedPoll = await vote_on_poll({ option_id: action.value, poll_id: selectedPoll?.id, user_id: userId });

        const build = buildPollResults(updatedPoll, userId);

        await client.chat.postEphemeral(build);
    } catch (error) {
        console.error('Error handling vote:', error);
        // await respond({
        //   response_type: 'ephemeral',
        //   text: 'Sorry, something went wrong with your vote. Please try again later.',
        // });
    }

}


// Function to update poll results
function buildPollResults(poll: IPoll, userId: string) {
    const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
    const currentTime = new Date();
    const isActive =
        new Date(poll.start_time) <= currentTime &&
        currentTime <= new Date(poll.end_time);

    return {
        channel: poll.team_id,
        user: userId,
        text: poll.question, // Fallback text
        blocks: [
            // Original question
            {
                type: "header",
                text: {
                    type: "plain_text",
                    text: `📊 ${poll.question}`,
                    emoji: true
                }
            },
            // Divider
            {
                type: "divider"
            },
            // Results for each option
            ...poll.options.map(option => {
                const percentage = totalVotes > 0 ? (option.votes / totalVotes * 100).toFixed(1) : 0;
                const progressBar = createProgressBar(percentage);

                return {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `*${option.text}*\n${progressBar} ${percentage}% (${option.votes} votes)${!poll.is_anonymous && option.voters?.length ? `\n👥 Voted: ${formatVoters(option.voters)}` : ''
                            }`
                    }
                };
            }),
            // Poll information footer
            {
                type: "context",
                elements: [
                    {
                        type: "mrkdwn",
                        text: `Total votes: ${totalVotes} • ${!isActive ? '🔒 Poll closed' : `Ends in ${formatTimeRemaining(poll.end_time)}`}`
                    }
                ]
            }
        ]
    };
}

// Helper function to create visual progress bar
function createProgressBar(percentage: any) {
    const filledBlocks = Math.round(percentage / 10);
    const emptyBlocks = 10 - filledBlocks;
    return '🟩'.repeat(filledBlocks) + '⬜'.repeat(emptyBlocks);
}



// Helper function to format remaining time
// Helper function to format remaining time
function formatTimeRemaining(endTime: any) {
    const remaining = new Date(endTime).getTime() - new Date().getTime();
    const hours = Math.floor(remaining / (1000 * 60 * 60));

    if (hours >= 24) {
        const days = Math.floor(hours / 24);
        return `${days} day${days !== 1 ? 's' : ''}`;
    }
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
}


// Helper function to format voter names
function formatVoters(voters: { id: string; name: string }[]) {
    if (voters.length <= 3) {
        return voters.map(voter => voter.name).join(', ');
    }
    return `${voters.slice(0, 3).map(voter => voter.name).join(', ')} and ${voters.length - 3} others`;
}
