import express from 'express';
import { Login } from '../controllers/authenticate';

const router = express.Router();

router.post('/login', Login);

export default router;
