import dotenv from 'dotenv';
dotenv.config();

import sequelize from './config/database';
import { AddTeam, RemoveTeam } from './commands/team';
import { AddMember, RemoveMember } from './commands/member';
import { app } from './config/app.config';

// Command: Add a Team
app.command("/add-team", AddTeam);

// Command: Remove a Team
app.command("/remove-team", RemoveTeam);

// Command: Add a Team Member
app.command("/add-member", AddMember);

// Command: Remove a Team Member
app.command("/remove-member", RemoveMember);

(async () => {
    // Start the app

    await sequelize.sync({ force: false });

    console.log('Database synchronized successfully.');
    await app.start(process.env.PORT || 3000);
    console.log("⚡️ Bolt app is running!");
})();
