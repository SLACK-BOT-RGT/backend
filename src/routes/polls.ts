import express from 'express';
import { authorizeAdmin } from '../middleware/auth';
import { createPollRequest, deletePollByIdRequest, getPollByIdRequest, getTeamPollsRequest, voteOnPollRequest } from '../controllers/polls';

const router = express.Router();

router.post('/', createPollRequest);

router.get('/team/:team_id', getTeamPollsRequest);

router.get('/:poll_id', getPollByIdRequest);

router.delete('/:poll_id', deletePollByIdRequest);

router.post('/vote', voteOnPollRequest);

export default router;
