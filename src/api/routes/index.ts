import { Router } from 'express';
import pricesRouter from './prices/prices.router';

const router = Router();

router.use('/prices', pricesRouter);

export default router;
