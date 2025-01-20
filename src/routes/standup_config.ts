import express from 'express';
import { validateRequestBody } from '../middleware/validate';
import { createTeamMembersValidator, teamMembersByIdValidator } from '../constants/validators';
import { createTeamMemberRequest, deleteTeamMemberRequest, getTeamMembersByIdRequest, getTeamMembersRequest, updateTeamMemberRequest } from '../controllers/team_members';
import { createStandupConfigRequest, getTeamStandupConfigRequest, updateStandupConfigRequest } from '../controllers/standup_confi';

const router = express.Router();


router.post('/', createStandupConfigRequest);

router.get('/:team_id', getTeamStandupConfigRequest);

router.put('/:config_id', updateStandupConfigRequest);

export default router;
