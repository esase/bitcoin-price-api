import { Router } from 'express';
import 'express-async-errors';

const router = Router();

router.get('/bitcoin', async (req, res) => {
    const price = await req.services.prices().findWithCommission({
        filters: { symbolFrom: 'BTC', symbolTo: 'USDT' },
        params: { commissionPercent: req.env.commissionPercent },
    });

    req.logger.info('Fetching a btc price', { price });

    res.json(price);
});

export default router;
