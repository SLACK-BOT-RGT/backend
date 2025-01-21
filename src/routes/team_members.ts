import express from 'express';
import { validateRequestBody } from '../middleware/validate';
import { teamMembersByIdValidator } from '../constants/validators';
import { createTeamMemberRequest, deleteTeamMemberRequest, getTeamMembersByIdRequest, getTeamMembersRequest, getTeamMembersTodayStatusRequest, getTeamMembersWeekStatusRequest, updateTeamMemberRequest } from '../controllers/team_members';
import { authorizeAdmin } from '../middleware/auth';

const router = express.Router();


router.post('/', authorizeAdmin(), createTeamMemberRequest);

router.get('/', getTeamMembersRequest);

router.get('/:id', teamMembersByIdValidator, validateRequestBody, getTeamMembersByIdRequest);

router.get('/today-status/:team_id', getTeamMembersTodayStatusRequest);
router.get('/week-status/:team_id', getTeamMembersWeekStatusRequest);

router.patch('/:id', teamMembersByIdValidator, validateRequestBody, authorizeAdmin(), updateTeamMemberRequest);

router.delete('/:id', teamMembersByIdValidator, validateRequestBody, authorizeAdmin(), deleteTeamMemberRequest);

export default router;
