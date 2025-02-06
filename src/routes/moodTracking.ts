import express from 'express';
import { authorizeAdmin } from '../middleware/auth';
import { createPollRequest, deletePollByIdRequest, getPollByIdRequest, getTeamPollsRequest, voteOnPollRequest } from '../controllers/polls';
import { getDailyMoodRequest, getMoodRequest } from '../controllers/moodTracking';

const router = express.Router();

router.post('/', createPollRequest);

router.get('/team/:team_id', getMoodRequest);

router.get('/daily/team/:team_id', getDailyMoodRequest);


export default router;
