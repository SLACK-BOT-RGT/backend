import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
dotenv.config();

import { app } from './config/app.config';
import { scheduleStandups } from './tasks/standupScheduler';
import sequelize from './config/database';

import { usersRoutes, slackRoutes, teamsRoutes, teamMembersRoutes, standupConfiqRoutes } from './routes';
import { errorHandler } from './middleware/errorHandler';


const server = express();
const port = process.env.PORT || 9000;

// Middlewares
server.use(bodyParser.json());
server.use(cors({
    origin: true,
    credentials: true
}));

// Set up all Slack app routes
slackRoutes(app);


// Routes
server.use('/api/users', usersRoutes);
server.use('/api/teams', teamsRoutes);
server.use('/api/team-members', teamMembersRoutes);
server.use('/api/standup-config', standupConfiqRoutes);

(async () => {
    // Start the app
    // associateModels()

    await sequelize.sync({ force: false });

    // scheduleStandups();

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