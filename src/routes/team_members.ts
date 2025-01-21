import express from 'express';
import { validateRequestBody } from '../middleware/validate';
import { createTeamMembersValidator, teamMembersByIdValidator } from '../constants/validators';
import { createTeamMemberRequest, deleteTeamMemberRequest, getTeamMembersByIdRequest, getTeamMembersRequest, getTeamMembersTodayStatusRequest, getTeamMembersWeekStatusRequest, updateTeamMemberRequest } from '../controllers/team_members';

const router = express.Router();


router.post('/', createTeamMemberRequest);

router.get('/', getTeamMembersRequest);

router.get('/:id', teamMembersByIdValidator, validateRequestBody, getTeamMembersByIdRequest);

router.get('/today-status/:team_id', getTeamMembersTodayStatusRequest);
router.get('/week-status/:team_id', getTeamMembersWeekStatusRequest);

router.patch('/:id', teamMembersByIdValidator, validateRequestBody, updateTeamMemberRequest);

router.delete('/:id', teamMembersByIdValidator, validateRequestBody, deleteTeamMemberRequest);

export default router;
