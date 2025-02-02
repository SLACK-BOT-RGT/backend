import express from 'express';
import { authorizeAdmin } from '../middleware/auth';
import { createPollRequest, getPollByIdRequest, getTeamPollsRequest, voteOnPollRequest } from '../controllers/polls';

const router = express.Router();

router.post('/', createPollRequest);

router.get('/team/:team_id', getTeamPollsRequest);

router.get('/:poll_id', getPollByIdRequest);

router.post('/vote', voteOnPollRequest);

export default router;
