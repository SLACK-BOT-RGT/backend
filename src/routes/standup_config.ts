import express from 'express';
import { createStandupConfigRequest, getTeamStandupConfigRequest, updateStandupConfigRequest } from '../controllers/standup_confi';
import { authorizeAdmin } from '../middleware/auth';

const router = express.Router();

router.post('/', authorizeAdmin(), createStandupConfigRequest);

router.get('/:team_id', getTeamStandupConfigRequest);

router.put('/:config_id', updateStandupConfigRequest);

export default router;
