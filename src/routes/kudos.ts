import express from 'express';
import { getKudosRequest } from '../controllers/kudos';

const router = express.Router();

router.get('/:team_id', getKudosRequest);


export default router;
