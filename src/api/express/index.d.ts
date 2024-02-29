export {};

import winston from 'winston';
import { PricesService } from '../../services';

declare global {
    namespace Express {
        export interface Request {
            logger: winston.Logger;
            services: {
                prices: () => PricesService;
            };
            env: {
                commissionPercent: number;
            };
        }
    }
}
