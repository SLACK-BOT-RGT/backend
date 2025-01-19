import express from 'express';
import { validateRequestBody } from '../middleware/validate';
import { createTeamMembersValidator, teamMembersByIdValidator } from '../constants/validators';
import { createTeamMemberRequest, deleteTeamMemberRequest, getTeamMembersByIdRequest, getTeamMembersRequest, updateTeamMemberRequest } from '../controllers/team_members';

const router = express.Router();


router.post('/', createTeamMembersValidator, validateRequestBody, createTeamMemberRequest);

router.get('/', getTeamMembersRequest);

router.get('/:id', teamMembersByIdValidator, validateRequestBody, getTeamMembersByIdRequest);

router.patch('/:id', teamMembersByIdValidator, validateRequestBody, updateTeamMemberRequest);

router.delete('/:id', teamMembersByIdValidator, validateRequestBody, deleteTeamMemberRequest);

export default router;
