// src/tasks/standupScheduler.ts
import { Op } from 'sequelize';
import { app } from '../config/app.config';
import cron from 'node-cron';
import { StandupConfigsModel, StandupResponseModel, TeamMemberModel, TeamModel, UserModel } from '../model';

export const scheduleStandups = () => {
    // Run every minute to check for standups
    cron.schedule('* * * * *', async () => {
        try {
            console.log("Run..");

            const now = new Date();
            const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
            const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];

            // Find all active standup configs for current time
            const configs = await StandupConfigsModel.findAll({
                where: {
                    is_active: true,
                    reminder_time: currentTime,
                    reminder_days: {
                        [Op.contains]: [currentDay]
                    }
                },
                include: [
                    {
                        model: TeamModel,
                        include: [{
                            model: TeamMemberModel,
                            include: [UserModel]
                        }]
                    }
                ]
            });

            for (const config of configs as (StandupConfigsModel & {
                Team: TeamModel & {
                    TeamMembers: (TeamMemberModel & { User: UserModel })[];
                };
            })[]) {
                // Check if standup already triggered today
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const existingStandup = await StandupResponseModel.findOne({
                    where: {
                        config_id: config.id,
                        submitted_at: {
                            [Op.gte]: today
                        }
                    }
                });

                if (!existingStandup) {
                    // Send standup reminder to each team member
                    for (const member of config.Team.TeamMembers) {
                        await app.client.chat.postMessage({
                            channel: member.User.id,
                            text: "🌟 Time for daily standup!",
                            blocks: [
                                {
                                    type: "section",
                                    text: {
                                        type: "mrkdwn",
                                        text: `Hey <@${member.User.id}>! It's time for the daily standup in *${config.Team.name}*`
                                    }
                                },
                                {
                                    type: "actions",
                                    elements: [
                                        {
                                            type: "button",
                                            text: {
                                                type: "plain_text",
                                                text: "Submit Standup"
                                            },
                                            action_id: "submit_standup",
                                            value: config.id.toString()
                                        }
                                    ]
                                }
                            ]
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error in standup scheduler:', error);
        }
    });
};