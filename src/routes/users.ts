import express from 'express';
import { createUserRequest, deleteUserRequest, getUserByIdRequest, getUsersRequest } from '../controllers/users';
import { createUserValidator, userByIdValidator } from '../constants/validators';
import { validateRequestBody } from '../middleware/validate';
import { authorizeAdmin } from '../middleware/auth';
const router = express.Router();


router.post('/', createUserValidator, validateRequestBody, authorizeAdmin(), createUserRequest);

router.get('/', getUsersRequest);

router.get('/:id', userByIdValidator, validateRequestBody, getUserByIdRequest);

router.delete('/:id', userByIdValidator, validateRequestBody, authorizeAdmin(), deleteUserRequest);

export default router;
