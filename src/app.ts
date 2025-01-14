import dotenv from 'dotenv';
dotenv.config();

import { app } from "./config/app.config";


/* Add functionality here */


(async () => {
    // Start the app
    await app.start(process.env.PORT || 3000);

    console.log('⚡️ Bolt app is running!');
})();