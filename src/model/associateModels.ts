// import StandupConfigsModel from './standupConfigs';
// import Team from './team';
// import TeamMember from './teamMember';
// import User from './user';


// export default function associateModels() {
//     User.hasMany(TeamMember, { foreignKey: 'user_id' });
//     TeamMember.belongsTo(User, { foreignKey: 'user_id' });

//     Team.hasMany(TeamMember, { foreignKey: 'team_id' });
//     TeamMember.belongsTo(Team, { foreignKey: 'team_id' });

//     Team.hasMany(StandupConfigsModel, { foreignKey: "team_id" });
//     StandupConfigsModel.belongsTo(Team, { foreignKey: "team_id", onDelete: "CASCADE" });
// }


// Update associations.ts
import MoodCheckin from './moodCheckins';
import Kudos from './kudos';
import Poll from './polls';
import PollResponse from './pollResponses';
import User from './user';
import TeamMember from './teamMember';
import Team from './team';
import StandupConfigs from './standupConfigs';
import StandupResponse from './standupResponse';

export default function associateModels() {
    // Existing associations
    User.hasMany(TeamMember, { foreignKey: 'user_id' });
    TeamMember.belongsTo(User, { foreignKey: 'user_id' });
    Team.hasMany(TeamMember, { foreignKey: 'team_id' });
    TeamMember.belongsTo(Team, { foreignKey: 'team_id' });

    // Updated StandupConfigs association with alias
    Team.hasMany(StandupConfigs, {
        foreignKey: 'team_id',
        as: 'StandupConfigs' // Define the alias here
    });
    StandupConfigs.belongsTo(Team, {
        foreignKey: 'team_id',
        as: 'Team',         // Define the alias here
        onDelete: 'CASCADE'
    });

    // New associations
    User.hasMany(StandupResponse, { foreignKey: 'user_id' });
    StandupResponse.belongsTo(User, { foreignKey: 'user_id' });
    StandupConfigs.hasMany(StandupResponse, { foreignKey: 'config_id' });
    StandupResponse.belongsTo(StandupConfigs, { foreignKey: 'config_id' });

    User.hasMany(MoodCheckin, { foreignKey: 'user_id' });
    MoodCheckin.belongsTo(User, { foreignKey: 'user_id' });
    Team.hasMany(MoodCheckin, { foreignKey: 'team_id' });
    MoodCheckin.belongsTo(Team, { foreignKey: 'team_id' });

    User.hasMany(Kudos, { foreignKey: 'from_user_id', as: 'GivenKudos' });
    User.hasMany(Kudos, { foreignKey: 'to_user_id', as: 'ReceivedKudos' });
    Kudos.belongsTo(User, { foreignKey: 'from_user_id', as: 'FromUser' });
    Kudos.belongsTo(User, { foreignKey: 'to_user_id', as: 'ToUser' });
    Team.hasMany(Kudos, { foreignKey: 'team_id' });
    Kudos.belongsTo(Team, { foreignKey: 'team_id' });

    Team.hasMany(Poll, { foreignKey: 'team_id' });
    Poll.belongsTo(Team, { foreignKey: 'team_id' });
    User.hasMany(Poll, { foreignKey: 'created_by_id' });
    Poll.belongsTo(User, { foreignKey: 'created_by_id' });

    Poll.hasMany(PollResponse, { foreignKey: 'poll_id' });
    PollResponse.belongsTo(Poll, { foreignKey: 'poll_id' });
    User.hasMany(PollResponse, { foreignKey: 'user_id' });
    PollResponse.belongsTo(User, { foreignKey: 'user_id' });
}
