import express from 'express';

import { validateRequestBody } from '../middleware/validate';
import { createTeamRequest, deleteTeamRequest, getTeamByIdRequest, getTeamsRequest, updateTeamByIdRequest } from '../controllers/team';
import { createTeamValidator, teamByIdValidator } from '../constants/validators';
import { authorizeAdmin } from '../middleware/auth';

const router = express.Router();


router.post('/', createTeamValidator, validateRequestBody, authorizeAdmin(), createTeamRequest);

router.get('/', getTeamsRequest);
//I don't get this, there is an error in validateRequestBody 
//router.get('/:id', teamByIdValidator validateRequestBody, getTeamByIdRequest);

router.get('/:id', teamByIdValidator, validateRequestBody, getTeamByIdRequest);

router.put('/:id', teamByIdValidator, validateRequestBody, authorizeAdmin(), updateTeamByIdRequest);

router.delete('/:id', teamByIdValidator, validateRequestBody, authorizeAdmin(), deleteTeamRequest);

export default router;
