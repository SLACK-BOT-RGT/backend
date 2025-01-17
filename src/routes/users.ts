import express from 'express';
import { createUserRequest, deleteUserRequest, getUserByIdRequest, getUsersRequest } from '../controllers/users';
import { createUserValidator, userByIdValidator } from '../constants/validators';
import { validateRequestBody } from '../middleware/validate';
const router = express.Router();


router.post('/', createUserValidator, validateRequestBody, createUserRequest);

router.get('/', getUsersRequest);

router.get('/:id', userByIdValidator, validateRequestBody, getUserByIdRequest);

router.delete('/:id', userByIdValidator, validateRequestBody, deleteUserRequest);

export default router;
