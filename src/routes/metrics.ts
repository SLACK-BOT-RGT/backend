import express from 'express';
import { getCombinedMetricsRequest } from '../controllers/metrics';

const router = express.Router();

router.get('/:team_id', getCombinedMetricsRequest);


export default router;
