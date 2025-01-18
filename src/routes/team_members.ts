import express from 'express';
import { validateRequestBody } from '../middleware/validate';
import { createTeamMembersValidator, teamMembersByIdValidator } from '../constants/team_members';
import { createTeamMemberRequest, deleteTeamMemberRequest, getTeamMembersByIdRequest, getTeamMembersRequest } from '../controllers/team_members';
const router = express.Router();


router.post('/', createTeamMembersValidator, validateRequestBody, createTeamMemberRequest);

router.get('/', getTeamMembersRequest );

router.get('/:id', teamMembersByIdValidator, validateRequestBody, getTeamMembersByIdRequest);

router.delete('/:id',   teamMembersByIdValidator,validateRequestBody,deleteTeamMemberRequest );

export default router;
