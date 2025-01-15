import Team from './team';
import TeamMember from './teamMember';
import User from './user';


export default function associateModels() {
    User.hasMany(TeamMember, { foreignKey: 'user_id' });
    TeamMember.belongsTo(User, { foreignKey: 'user_id' });

    Team.hasMany(TeamMember, { foreignKey: 'team_id' });
    TeamMember.belongsTo(Team, { foreignKey: 'team_id' });
}
