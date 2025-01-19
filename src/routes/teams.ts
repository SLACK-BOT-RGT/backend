import express from 'express';

import { validateRequestBody } from '../middleware/validate';
import { createTeamRequest, deleteTeamRequest, getTeamByIdRequest, getTeamsRequest, updateTeamByIdRequest } from '../controllers/team';
import { createTeamValidator, teamByIdValidator } from '../constants/validators';

const router = express.Router();


router.post('/', createTeamValidator, validateRequestBody, createTeamRequest);

router.get('/', getTeamsRequest);
//I don't get this, there is an error in validateRequestBody 
//router.get('/:id', teamByIdValidator validateRequestBody, getTeamByIdRequest);

router.get('/:id', teamByIdValidator, validateRequestBody, getTeamByIdRequest);

router.put('/:id', teamByIdValidator, validateRequestBody, updateTeamByIdRequest);

router.delete('/:id', teamByIdValidator, validateRequestBody, deleteTeamRequest);

export default router;
