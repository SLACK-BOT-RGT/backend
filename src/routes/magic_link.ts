import express from 'express';
import { sendMagicLinkRequest, verifyMagicLinkRequest } from '../controllers/magic_link';

const router = express.Router();

router.post('/', sendMagicLinkRequest);
router.get('/verify/:token', verifyMagicLinkRequest);

export default router;
