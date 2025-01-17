import dotenv from 'dotenv';
dotenv.config();

import sequelize from './config/database';
import { AddTeam, RemoveTeam, SetQuestions, SetReminder } from './commands/team';
import { AddMember, InviteUserToChannel, ListAllUsers, RemoveMember, RemoveUserFromChannel } from './commands/member';
import { app } from './config/app.config';
import { openHomePageEvent } from './events/appHomeOpenedEvent';
import { CreateTeamAction, RemoveTeamAction } from './actions/team';
import { CreateTeamModalSubmission, RemoveTeamModalSubmission } from './views/team';
import { AddTeamMemberAction, RemoveTeamMemberAction } from './actions/members';
import { AddTeamMemberModalSubmission, RemoveTeamMemberModalSubmission } from './views/members';
import { StartStandup, SkipStandup, ViewTodayStandups } from './commands/standup';
import { StandupResponseModalSubmission } from './views/standup';

import { scheduleStandups } from './tasks/standupScheduler';
import { SubmitStandupAction } from './actions/standup';

// Command: Add a Team
app.command("/add-team", AddTeam);

// Command: Remove a Team
app.command("/remove-team", RemoveTeam);

// Command: Add a Team Member
app.command("/add-member", AddMember);

// Command: Remove a Team Member
app.command("/remove-member", RemoveMember);

// Command: Invite a Team Member
app.command("/invite-user", InviteUserToChannel);

// Command: Remove a Team Member
app.command("/remove-user", RemoveUserFromChannel);

// Command: List all users
app.command("/list-users", ListAllUsers);

// Add to your existing imports
// Add new commands
app.command("/standup", StartStandup);
app.command("/skip-standup", SkipStandup);
app.command("/view-standups", ViewTodayStandups);

// Add view submission handler
app.view("standup_response_modal", StandupResponseModalSubmission);

// Command: Set team schedule
app.command("/set-questions", SetQuestions);

// Command: Set team schedule
app.command("/set-reminder", SetReminder);


app.event('app_home_opened', openHomePageEvent);

app.action('create_team', CreateTeamAction);
app.view("create_team_modal", CreateTeamModalSubmission);

app.action('remove_team', RemoveTeamAction);
app.view("remove_team_modal", RemoveTeamModalSubmission);

app.action('add_team_member', AddTeamMemberAction);
app.view("add_team_member_modal", AddTeamMemberModalSubmission);

app.action('remove_team_member', RemoveTeamMemberAction);
app.view("remove_team_member_modal", RemoveTeamMemberModalSubmission);

app.action('submit_standup', SubmitStandupAction);


(async () => {
    // Start the app

    await sequelize.sync({ force: false });

    scheduleStandups();

    console.log('Database synchronized successfully.');
    await app.start(process.env.PORT || 3000);
    console.log("⚡️ Bolt app is running!");
})();
