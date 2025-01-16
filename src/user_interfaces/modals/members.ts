import { UsersListResponse } from "@slack/web-api";
import { TeamModel } from "../../model";

export const addTeamMemberModal = async (userId: string, client: any, triggerId: string) => {
    try {
        // Fetch teams from the database
        const teams = await TeamModel.findAll(); // Adjust based on your ORM (e.g., Sequelize)

        // Fetch all users
        const userList: UsersListResponse = await client.users.list({});
        const members = userList.members;

        if (!members || members.length === 0) {
            return client.chat.postEphemeral({
                channel: userId,
                text: "No users found in the workspace.",
                user: userId,
            });
        }

        // Format user details
        const userDetails = members
            .filter((member) => !member.is_bot && !member.deleted)

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

        const memberOptions = userDetails.map((user) => ({
            text: {
                type: "plain_text",
                text: user.profile?.real_name || user.name,
            },
            value: user.profile?.email, // Use team ID or a unique identifier
        }));

        // Open the modal
        const result = await client.views.open({
            trigger_id: triggerId,
            view: {
                type: "modal",
                callback_id: "add_team_member_modal",
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
                            type: "radio_buttons", // Allows multi-selection
                            action_id: "selected_teams", // Identifier for this input
                            options: teamOptions, // Dynamically generated options
                        },
                        label: {
                            type: "plain_text",
                            text: "Teams",
                        },
                    },
                    {
                        type: "input",
                        block_id: "member_selection", // Unique identifier for this block
                        element: {
                            type: "multi_static_select", // Allows multi-selection
                            action_id: "selected_members", // Identifier for this input
                            placeholder: {
                                type: "plain_text",
                                text: "Select members to invite",
                            },
                            options: memberOptions, // Dynamically generated options
                        },
                        label: {
                            type: "plain_text",
                            text: "Members",
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

export const removeTeamMemberModal = async (userId: string, client: any, triggerId: string) => {
    try {
        // Fetch teams from the database
        const teams = await TeamModel.findAll(); // Adjust based on your ORM (e.g., Sequelize)

        // Fetch all users
        const userList: UsersListResponse = await client.users.list({});
        const members = userList.members;

        if (!members || members.length === 0) {
            return client.chat.postEphemeral({
                channel: userId,
                text: "No users found in the workspace.",
                user: userId,
            });
        }

        // Format user details
        const userDetails = members
            .filter((member) => !member.is_bot && !member.deleted)

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

        const memberOptions = userDetails.map((user) => ({
            text: {
                type: "plain_text",
                text: user.profile?.real_name || user.name,
            },
            value: user.profile?.email, // Use team ID or a unique identifier
        }));

        // Open the modal
        const result = await client.views.open({
            trigger_id: triggerId,
            view: {
                type: "modal",
                callback_id: "remove_team_member_modal",
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
                            type: "radio_buttons", // Allows multi-selection
                            action_id: "selected_teams", // Identifier for this input
                            options: teamOptions, // Dynamically generated options
                        },
                        label: {
                            type: "plain_text",
                            text: "Teams",
                        },
                    },
                    {
                        type: "input",
                        block_id: "member_selection", // Unique identifier for this block
                        element: {
                            type: "multi_static_select", // Allows multi-selection
                            action_id: "selected_members", // Identifier for this input
                            placeholder: {
                                type: "plain_text",
                                text: "Select members to invite",
                            },
                            options: memberOptions, // Dynamically generated options
                        },
                        label: {
                            type: "plain_text",
                            text: "Members",
                        },
                    },
                ],
            },
        });

        if (!result.ok) {
            console.error("Error opening the modal:", result.error);
        }
    } catch (error) {
        console.error("Error fetching channels or opening the modal:", error);

        await client.chat.postEphemeral({
            channel: userId,
            text: "An error occurred while opening the modal. Please try again later.",
            user: userId,
        });
    }
};



// Handler for the channel selection submission
// export const handleChannelSelection = async (view: any, client: any, userId: string) => {
//     try {
//         const channelId = view.state.values.channel_selection.selected_channel.selected_option.value;

//         // Fetch members of the selected channel
//         const channelMembersResponse = await client.conversations.members({
//             channel: channelId,
//         });

//         const channelMembers = channelMembersResponse.members;

//         if (!channelMembers || channelMembers.length === 0) {
//             return client.chat.postEphemeral({
//                 channel: userId,
//                 text: "No members found in the selected channel.",
//                 user: userId,
//             });
//         }

//         // Fetch detailed user information
//         const userListResponse: UsersListResponse = await client.users.list({});
//         const allUsers = userListResponse.members;

//         if (!allUsers || allUsers.length === 0) {
//             return client.chat.postEphemeral({
//                 channel: userId,
//                 text: "Unable to fetch user details.",
//                 user: userId,
//             });
//         }

//         // Filter and map channel members for modal options
//         const memberOptions = channelMembers
//             .map((memberId: any) => {
//                 const user = allUsers.find((u) => u.id === memberId);
//                 if (user && !user.is_bot && !user.deleted) {
//                     return {
//                         text: {
//                             type: "plain_text",
//                             text: user.profile?.real_name || user.name,
//                         },
//                         value: user.id,
//                     };
//                 }
//                 return null;
//             })
//             .filter(Boolean);

//         if (memberOptions.length === 0) {
//             return client.chat.postEphemeral({
//                 channel: userId,
//                 text: "No valid members to remove from the selected channel.",
//                 user: userId,
//             });
//         }

//         // Open the modal to select members for removal
//         const result = await client.views.open({
//             trigger_id: view.trigger_id,
//             view: {
//                 type: "modal",
//                 callback_id: "remove_team_member_modal",
//                 submit: {
//                     type: "plain_text",
//                     text: "Remove",
//                     emoji: true,
//                 },
//                 close: {
//                     type: "plain_text",
//                     text: "Cancel",
//                     emoji: true,
//                 },
//                 title: {
//                     type: "plain_text",
//                     text: "Remove Members",
//                     emoji: true,
//                 },
//                 blocks: [
//                     {
//                         type: "input",
//                         block_id: "member_selection", // Unique identifier for this block
//                         element: {
//                             type: "multi_static_select", // Allows multi-selection
//                             action_id: "selected_members", // Identifier for this input
//                             placeholder: {
//                                 type: "plain_text",
//                                 text: "Select members to remove",
//                             },
//                             options: memberOptions, // Dynamically generated options
//                         },
//                         label: {
//                             type: "plain_text",
//                             text: "Members",
//                         },
//                     },
//                 ],
//             },
//         });

//         if (!result.ok) {
//             console.error("Error opening the member removal modal:", result.error);
//         }
//     } catch (error) {
//         console.error("Error handling channel selection or opening member removal modal:", error);

//         await client.chat.postEphemeral({
//             channel: userId,
//             text: "An error occurred while opening the modal. Please try again later.",
//             user: userId,
//         });
//     }
// };

