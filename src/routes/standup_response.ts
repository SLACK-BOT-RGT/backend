import express from 'express';
import { createStandupResponsesRequest, getDraftedStandupResponsesRequest, getStandupResponsesRequest } from '../controllers/standup_response';

const router = express.Router();


router.post('/', createStandupResponsesRequest);

router.get('/', getStandupResponsesRequest);

router.get('/drafted', getDraftedStandupResponsesRequest);

export default router;
