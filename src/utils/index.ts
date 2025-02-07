import { WebClient } from "@slack/web-api";
import { create_team } from "../services/team";
const client = new WebClient(process.env.SLACK_BOT_TOKEN);

export const generateCode = (): number => {
    const min = 100000;
    const max = 999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const fetchActiveChannels = async () => {
    try {
        const response = await client.conversations.list({
            exclude_archived: true, // Ensures only active channels are returned
            types: "public_channel,private_channel", // Fetch both public & private channels
        });

        if (!response.channels) {
            throw new Error("No channels found");
        }

        return response.channels;
    } catch (error) {
        console.error("Error fetching channels:", error);
        return [];
    }
};

const processChannels = async () => {
    const channels = await fetchActiveChannels();

    for (const channel of channels) {
        await create_team({
            id: channel.id as string,
            name: channel.name as string,
            description: "",
        });
    }
};

const removeAllMembers = async () => {
    try {
        // Fetch all active channels
        const response = await client.conversations.list({
            exclude_archived: true,
            types: "public_channel,private_channel",
        });

        if (!response.channels) {
            throw new Error("No channels found");
        }

        const channels = response.channels;

        for (const channel of channels) {
            if (!channel.id) continue;

            // Check if the bot is in the channel
            const botInfo = await client.conversations.info({ channel: channel.id });

            if (!botInfo.channel?.is_member) {
                console.log(`Bot is not in channel: ${channel.name}, skipping...`);
                continue;
            }

            // Fetch members of the channel
            const membersResponse = await client.conversations.members({
                channel: channel.id,
            });

            if (!membersResponse.members) continue;

            const members = membersResponse.members;

            // Remove each member (except the bot itself)
            for (const member of members) {
                if (member !== "YOUR_BOT_USER_ID") {
                    try {
                        await client.conversations.kick({
                            channel: channel.id,
                            user: member,
                        });
                        console.log(`Removed ${member} from ${channel.name}`);
                    } catch (kickError) {
                        console.error(
                            `Failed to remove ${member} from ${channel.name}:`,
                            kickError
                        );
                    }
                }
            }
        }

        console.log("All members removed from all channels (where bot is present).");
    } catch (error) {
        console.error("Error removing members:", error);
    }
};