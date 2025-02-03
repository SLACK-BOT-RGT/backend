import { app } from '../config/app.config';
import { create_standup_responses } from '../services/standup_response';
import { Op } from 'sequelize';
import { StandupConfigsModel, StandupResponseModel, TeamMemberModel, TeamModel, UserModel } from '../model';
import cron from 'node-cron';
import moment from 'moment-timezone';
import { sendPollToChannel } from './poll';

export const scheduleStandups = () => {
    // Run every minute to check for standups
    cron.schedule('* * * * *', async () => {
        try {
            console.log("Running standup scheduler...");

            const now = moment.utc(); // Current UTC time

            // Fetch all active standup configs
            const configs = await StandupConfigsModel.findAll({
                where: {
                    is_active: true
                },
                include: [
                    {
                        model: TeamModel,
                        include: [
                            {
                                model: TeamMemberModel,
                                include: [UserModel]
                            }
                        ]
                    }
                ]
            });

            for (const config of configs as (StandupConfigsModel & {
                Team: TeamModel & {
                    TeamMembers: (TeamMemberModel & { User: UserModel })[];
                };
            })[]) {
                // Iterate through team members to handle reminders based on their time zone
                for (const member of config.Team.TeamMembers) {
                    const userTimeZone = member.User.timeZone || 'UTC'; // Default to UTC if no time zone is set
                    const userTime = now.clone().tz(userTimeZone); // Convert current time to user's time zone
                    const userCurrentTime = userTime.format('HH:mm'); // HH:MM format in user's local time
                    const userCurrentDay = userTime.format('dddd').toLowerCase(); // Day in lowercase

                    if (!config.reminder_days || !config.reminder_time) return;

                    const reminderTime = config.reminder_time.slice(0, 5);

                    // Check if the user's current time and day match the config's reminder settings
                    if (
                        reminderTime === userCurrentTime &&
                        config.reminder_days.includes(userCurrentDay)
                    ) {
                        // Check if a standup has already been triggered today for this user
                        const today = userTime.clone().startOf('day').toDate();

                        const existingStandup = await StandupResponseModel.findOne({
                            where: {
                                config_id: config.id,
                                submitted_at: {
                                    [Op.gte]: today
                                },
                                user_id: member.User.id // Ensure this standup is user-specific
                            }
                        });

                        if (!existingStandup) {
                            await create_standup_responses({ config_id: config.id, responses: [], user_id: member.User.id });

                            // Send standup reminder to the user
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

                    // Handle missed standups
                    const userDueTime = moment.tz(
                        `${userCurrentDay} ${config.due_time}`,
                        'dddd HH:mm',
                        userTimeZone
                    );

                    // Check if the due time has passed for the team
                    if (now.isAfter(userDueTime)) {
                        // Fetch responses with status 'not responded' for the given config and user
                        const missedStandups = await StandupResponseModel.findAll({
                            where: {
                                config_id: config.id,
                                user_id: member.User.id,
                                status: 'not responded',
                                submitted_at: {
                                    [Op.lt]: userDueTime.toDate()
                                }
                            }
                        });

                        // Update their status to 'missed'
                        if (missedStandups.length > 0) {
                            await StandupResponseModel.update(
                                { status: 'missed' },
                                {
                                    where: {
                                        id: missedStandups.map((standup) => standup.id)
                                    }
                                }
                            );
                        }
                    }

                }
            }
        } catch (error) {
            console.error('Error in standup scheduler:', error);
        }
    });
};


// import { Op } from 'sequelize';
// import { app } from '../config/app.config';
// import cron from 'node-cron';
// import { StandupConfigsModel, StandupResponseModel, TeamMemberModel, TeamModel, UserModel } from '../model';
// import moment from 'moment-timezone';
// import { create_standup_responses } from '../services/standup_response';

// export const scheduleStandups = () => {
//     // Run every minute to check for standups
//     cron.schedule('* * * * *', async () => {
//         try {
//             console.log("Running standup scheduler...");

//             const now = moment.utc(); // Current UTC time

//             // Fetch all active standup configs
//             const configs = await StandupConfigsModel.findAll({
//                 where: {
//                     is_active: true
//                 },
//                 include: [
//                     {
//                         model: TeamModel,
//                         include: [
//                             {
//                                 model: TeamMemberModel,
//                                 include: [UserModel]
//                             }
//                         ]
//                     }
//                 ]
//             });

//             for (const config of configs as (StandupConfigsModel & {
//                 Team: TeamModel & {
//                     TeamMembers: (TeamMemberModel & { User: UserModel })[];
//                 };
//             })[]) {
//                 // Iterate through team members to handle reminders based on their time zone
//                 for (const member of config.Team.TeamMembers) {
//                     const userTimeZone = member.User.timeZone || 'UTC'; // Default to UTC if no time zone is set
//                     const userTime = now.clone().tz(userTimeZone); // Convert current time to user's time zone
//                     const userCurrentTime = userTime.format('HH:mm'); // HH:MM format in user's local time
//                     const userCurrentDay = userTime.format('dddd').toLowerCase(); // Day in lowercase



//                     if (!config.reminder_days || !config.reminder_time) return;

//                     const reminderTime = config.reminder_time.slice(0, 5);

//                     // Check if the user's current time and day match the config's reminder settings
//                     if (
//                         reminderTime === userCurrentTime &&
//                         config.reminder_days.includes(userCurrentDay)
//                     ) {
//                         // Check if a standup has already been triggered today for this user
//                         const today = userTime.clone().startOf('day').toDate();

//                         const existingStandup = await StandupResponseModel.findOne({
//                             where: {
//                                 config_id: config.id,
//                                 submitted_at: {
//                                     [Op.gte]: today
//                                 },
//                                 user_id: member.User.id // Ensure this standup is user-specific
//                             }
//                         });


//                         if (!existingStandup) {
//                             await create_standup_responses({ config_id: config.id, responses: [], user_id: member.User.id });

//                             // Send standup reminder to the user
//                             await app.client.chat.postMessage({
//                                 channel: member.User.id,
//                                 text: "🌟 Time for daily standup!",
//                                 blocks: [
//                                     {
//                                         type: "section",
//                                         text: {
//                                             type: "mrkdwn",
//                                             text: `Hey <@${member.User.id}>! It's time for the daily standup in *${config.Team.name}*`
//                                         }
//                                     },
//                                     {
//                                         type: "actions",
//                                         elements: [
//                                             {
//                                                 type: "button",
//                                                 text: {
//                                                     type: "plain_text",
//                                                     text: "Submit Standup"
//                                                 },
//                                                 action_id: "submit_standup",
//                                                 value: config.id.toString()
//                                             }
//                                         ]
//                                     }
//                                 ]
//                             });
//                         }
//                     }
//                 }
//             }
//         } catch (error) {
//             console.error('Error in standup scheduler:', error);
//         }
//     });
// };



// // src/tasks/standupScheduler.ts
// import { Op } from 'sequelize';
// import { app } from '../config/app.config';
// import cron from 'node-cron';
// import { StandupConfigsModel, StandupResponseModel, TeamMemberModel, TeamModel, UserModel } from '../model';

// export const scheduleStandups = () => {
//     // Run every minute to check for standups
//     cron.schedule('* * * * *', async () => {
//         try {
//             console.log("Run..");

//             const now = new Date();
//             const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
//             const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];

//             // Find all active standup configs for current time
//             const configs = await StandupConfigsModel.findAll({
//                 where: {
//                     is_active: true,
//                     reminder_time: currentTime,
//                     reminder_days: {
//                         [Op.contains]: [currentDay]
//                     }
//                 },
//                 include: [
//                     {
//                         model: TeamModel,
//                         include: [{
//                             model: TeamMemberModel,
//                             include: [UserModel]
//                         }]
//                     }
//                 ]
//             });

//             for (const config of configs as (StandupConfigsModel & {
//                 Team: TeamModel & {
//                     TeamMembers: (TeamMemberModel & { User: UserModel })[];
//                 };
//             })[]) {
//                 // Check if standup already triggered today
//                 const today = new Date();
//                 today.setHours(0, 0, 0, 0);

//                 const existingStandup = await StandupResponseModel.findOne({
//                     where: {
//                         config_id: config.id,
//                         submitted_at: {
//                             [Op.gte]: today
//                         }
//                     }
//                 });

//                 if (!existingStandup) {
//                     // Send standup reminder to each team member
//                     for (const member of config.Team.TeamMembers) {
//                         await app.client.chat.postMessage({
//                             channel: member.User.id,
//                             text: "🌟 Time for daily standup!",
//                             blocks: [
//                                 {
//                                     type: "section",
//                                     text: {
//                                         type: "mrkdwn",
//                                         text: `Hey <@${member.User.id}>! It's time for the daily standup in *${config.Team.name}*`
//                                     }
//                                 },
//                                 {
//                                     type: "actions",
//                                     elements: [
//                                         {
//                                             type: "button",
//                                             text: {
//                                                 type: "plain_text",
//                                                 text: "Submit Standup"
//                                             },
//                                             action_id: "submit_standup",
//                                             value: config.id.toString()
//                                         }
//                                     ]
//                                 }
//                             ]
//                         });
//                     }
//                 }
//             }
//         } catch (error) {
//             console.error('Error in standup scheduler:', error);
//         }
//     });
// };