import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
dotenv.config();


import { usersRoutes, slackRoutes, teamsRoutes, teamMembersRoutes, standupConfiqRoutes, standupResponsesRoutes, magicLinkRoutes, authRoutes, pollsRoutes, kudosRoutes, metricsRoutes, moodsRoutes } from './routes';
import { app } from './config/app.config';
import { authenticateToken } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { scheduleStandups } from './tasks/standupScheduler';
import { scheduleUserMonitoring } from './tasks/userMonitoring';
import { WebClient } from '@slack/web-api';
import sequelize from './config/database';


const server = express();
const port = process.env.PORT || 9000;
const client = new WebClient(process.env.SLACK_BOT_TOKEN);
// Middlewares
server.use(bodyParser.json());
server.use(cors({
    origin: true,
    credentials: true
}));

// Set up all Slack app routes
slackRoutes(app);


// Routes
server.use('/api/send-magic-link', magicLinkRoutes);
server.use(authenticateToken);
server.use('/api/auth', authRoutes);
server.use('/api/users', usersRoutes);
server.use('/api/teams', teamsRoutes);
server.use('/api/team-members', teamMembersRoutes);
server.use('/api/standup-config', standupConfiqRoutes);
server.use('/api/standup-responses', standupResponsesRoutes);
server.use('/api/polls', pollsRoutes);
server.use('/api/kudos', kudosRoutes);
server.use('/api/metrics', metricsRoutes);
server.use('/api/moods', moodsRoutes);

(async () => {
    // Start the app
    // associateModels()

    await sequelize.sync({ force: false });

    // scheduleStandups();


    // const userList = await client.users.list({});
    // const members = userList.members;

    // console.log('====================================');
    // console.log(members);
    // console.log('====================================');
    // fetchAllChannels();

    // scheduleUserMonitoring();

    console.log('Database synchronized successfully.');
    await app.start(process.env.PORT || 3000);
    console.log("⚡️ Bolt app is running!");
})();

// Handle 404 Errors
server.use((req: Request, res: Response) => {
    res.json({ message: 'Endpoint Not Found:(' });
});

// Error Handler Middleware
server.use(errorHandler);


server.listen(port, () => {
    console.log('====================================');
    console.log("Listening");
    console.log('====================================');
});