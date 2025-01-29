import express from 'express';
import { createStandupResponsesRequest, deleteStandupResponseRequest, getDraftedStandupResponsesRequest, getStandupResponsesRequest } from '../controllers/standup_response';

const router = express.Router();


router.post('/', createStandupResponsesRequest);

router.get('/', getStandupResponsesRequest);

router.get('/drafted', getDraftedStandupResponsesRequest);

router.delete('/:id', deleteStandupResponseRequest);

export default router;
