import express, { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import router from './api/routes';
import { rateLimit } from 'express-rate-limit';
import winston, { format, transports } from 'winston';
import { PricesService } from './services';
import { PriceHttpBinanceRepository } from './infrastructure/repositories/http/price.http.binance.repository';
import axios from 'axios';
import Redis from 'ioredis';

dotenv.config();

const port = process.env.PORT;
const isDevEnvironment = process.env.NODE_ENV === 'development';

async function main() {
    // init logger
    const logger = winston.createLogger({
        format: format.combine(format.splat(), format.simple()),
        transports: [new transports.Console()],
    });

    // init redis client
    const redis = new Redis({
        port: Number(process.env.REDIS_PORT),
        host: process.env.REDIS_HOST,
    });

    // init repositories
    const priceRepository = new PriceHttpBinanceRepository(axios);

    const app: Application = express();
    app.use(bodyParser.json());

    // inject services
    app.use((req, _, next) => {
        req.logger = logger;
        req.env = {
            commissionPercent: Number(process.env.SERVICE_COMMISSION_PERCENT),
        };
        req.services = {
            prices: () =>
                new PricesService(
                    priceRepository,
                    redis,
                    Number(process.env.UPDATE_FREQUENCY_MILLISECONDS),
                ),
        };

        next();
    });

    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    });
    app.use(limiter);

    app.use('/', router);

    // add a global error handler
    app.use((err: Error, _: Request, res: Response, next: NextFunction) => {
        const errorMessage = err.message || 'Something went wrong';
        const errorStatus = 500;

        logger.error(errorMessage, { stack: err.stack });

        if (isDevEnvironment) {
            res.status(errorStatus).json({});

            return next();
        }

        res.status(errorStatus).json({
            success: false,
            status: errorStatus,
            message: errorMessage,
            stack: err.stack,
        });

        next();
    });

    app.listen(port, () => {
        console.log(`Server is Fire at http://localhost:${port}`);
    });
}

main();
