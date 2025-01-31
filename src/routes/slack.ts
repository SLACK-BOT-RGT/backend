import { AddMember, InviteUserToChannel, ListAllUsers, RemoveMember, RemoveUserFromChannel } from '../commands/member';
import { AddTeam, RemoveTeam, SetQuestions, SetReminder } from '../commands/team';
import { AddTeamMemberAction, RemoveTeamMemberAction } from '../actions/members';
import { AddTeamMemberModalSubmission, RemoveTeamMemberModalSubmission } from '../views/members';
import { App, StringIndexed } from '@slack/bolt';
import { CreateTeamAction, RemoveTeamAction } from '../actions/team';
import { CreateTeamModalSubmission, RemoveTeamModalSubmission } from '../views/team';
import { GiveKudos } from '../commands/kudos';
import { HandleKudosSubmission } from '../views/kudos';
import { openHomePageEvent } from '../events/appHomeOpenedEvent';
import { StandupResponseModalSubmission } from '../views/standup';
import { StartStandup, SkipStandup, ViewTodayStandups } from '../commands/standup';
import { SubmitStandupAction } from '../actions/standup';

export default function setupSlackRoutes(app: App<StringIndexed>) {
    // Commands
    app.command("/add-team", AddTeam);
    app.command("/remove-team", RemoveTeam);
    app.command("/add-member", AddMember);
    app.command("/remove-member", RemoveMember);
    app.command("/invite-user", InviteUserToChannel);
    app.command("/remove-user", RemoveUserFromChannel);
    app.command("/list-users", ListAllUsers);
    app.command("/standup", StartStandup);
    app.command("/skip-standup", SkipStandup);
    app.command("/view-standups", ViewTodayStandups);
    app.command("/set-questions", SetQuestions);
    app.command("/set-reminder", SetReminder);
    app.command("/kudos", GiveKudos)

    // Events
    app.event('app_home_opened', openHomePageEvent);

    // Actions
    app.action('create_team', CreateTeamAction);
    app.action('remove_team', RemoveTeamAction);
    app.action('add_team_member', AddTeamMemberAction);
    app.action('remove_team_member', RemoveTeamMemberAction);
    app.action('submit_standup', SubmitStandupAction);

    // Views
    app.view("standup_response_modal", StandupResponseModalSubmission);
    app.view("create_team_modal", CreateTeamModalSubmission);
    app.view("remove_team_modal", RemoveTeamModalSubmission);
    app.view("add_team_member_modal", AddTeamMemberModalSubmission);
    app.view("remove_team_member_modal", RemoveTeamMemberModalSubmission);
    app.view("submit_kudos", HandleKudosSubmission);
}

