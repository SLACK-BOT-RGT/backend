import cron from 'node-cron';
import { WebClient } from '@slack/web-api';
import { create_user, get_user_by_email } from '../services/users';

const client = new WebClient(process.env.SLACK_BOT_TOKEN);

export const scheduleUserMonitoring = () => {
    // Schedule cron job to run every minute
    cron.schedule('* * * * *', async () => {
        try {
            console.log("User monitoring cron job started...");

            // Fetch all Slack users
            const userList = await client.users.list({});
            const members = userList.members;

            if (!members || members.length === 0) {
                console.log("No members found.");
                return;
            }

            // Filter valid user details
            const validUsers = members.filter(
                (member) =>
                    !member.is_bot &&
                    !member.deleted &&
                    member.name !== 'slackbot' &&
                    member.profile?.email &&
                    (member.real_name || member.name)
            );

            // Process valid users
            await Promise.all(
                validUsers.map(async (user) => {
                    if (!user.profile?.email) return;
                    const existingUser = await get_user_by_email({ email: user.profile?.email });
                    if (existingUser) return;

                    await create_user({
                        email: user.profile.email,
                        name: user.real_name || user.name || '',
                        id: user.id,
                        timeZone: user.tz || 'UTC',
                        is_admin: user.is_admin || false,
                    });

                    console.log(`New User Added: ${user.profile.email}`);
                })
            );

        } catch (error: any) {
            console.error('Error in user monitoring:', error.message, error.stack);
        }
    });
};
