import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import express from 'express';
dotenv.config();

import { app } from './config/app.config';
import { scheduleStandups } from './tasks/standupScheduler';
import sequelize from './config/database';

import { usersRoutes, slackRoutes } from './routes';
import { errorHandler } from './middleware/errorHandler';

const server = express();
const port = process.env.PORT || 9000;

server.use(bodyParser.json());

// Set up all Slack app routes
slackRoutes(app);


// Routes
server.use('/api/users', usersRoutes);


(async () => {
    // Start the app
    // associateModels()

    await sequelize.sync({ force: false });

    scheduleStandups();

    console.log('Database synchronized successfully.');
    await app.start(process.env.PORT || 3000);
    console.log("⚡️ Bolt app is running!");
})();

// Error Handler Middleware
server.use(errorHandler);


server.listen(port, () => {
    console.log('====================================');
    console.log("Listening");
    console.log('====================================');
})