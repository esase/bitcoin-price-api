import { PricesService } from './price.service';
import { PriceRepository } from '../../domain/repositories/price.repository';
import Redis from 'ioredis';
import * as _ from '@jest-mock/express';

describe('/services/price', () => {
    let priceService: PricesService;

    let repository: PriceRepository;
    let redis: Redis;

    const updateFrequencyMilliseconds = 100;
    const commissionPercent = 0.5;

    beforeEach(() => {
        repository = {} as PriceRepository;
        redis = {} as Redis;

        priceService = new PricesService(
            repository,
            redis,
            updateFrequencyMilliseconds,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findWithCommission', () => {
        const symbolFrom = 'BTC';
        const symbolTo = 'USDT';

        test('should return cached data', async () => {
            const cachedData = {
                price: 100,
                lastUpdated: new Date().toISOString(),
            };

            redis.get = jest.fn().mockResolvedValue(JSON.stringify(cachedData));

            const result = await priceService.findWithCommission({
                filters: { symbolFrom, symbolTo },
                params: { commissionPercent: commissionPercent },
            });

            expect(redis.get).toHaveBeenCalledWith(
                `PricesService["findWithCommission",{"filters":{"symbolFrom":"${symbolFrom}","symbolTo":"${symbolTo}"},"params":{"commissionPercent":${commissionPercent}}}]`,
            );

            expect(result).toStrictEqual(cachedData);
        });

        test('should return data from repository', async () => {
            redis.get = jest.fn().mockResolvedValue(null);
            redis.set = jest.fn();

            jest.useFakeTimers();
            jest.setSystemTime(new Date('2012-10-10'));

            const bidPrice = 100;
            const askPrice = 200;

            repository.find = jest.fn().mockResolvedValue({
                symbol: symbolFrom + symbolTo,
                bidPrice,
                bidQty: 0,
                askPrice,
                askQty: 0,
            });

            const result = await priceService.findWithCommission({
                filters: { symbolFrom, symbolTo },
                params: { commissionPercent: commissionPercent },
            });

            expect(repository.find).toHaveBeenCalledWith({
                filters: { symbolFrom, symbolTo },
                params: { commissionPercent: commissionPercent },
            });

            const expectedValue = {
                price: 150.75,
                lastUpdated: '2012-10-10T00:00:00.000Z',
            };

            expect(redis.set).toHaveBeenCalledWith(
                `PricesService["findWithCommission",{"filters":{"symbolFrom":"${symbolFrom}","symbolTo":"${symbolTo}"},"params":{"commissionPercent":${commissionPercent}}}]`,
                JSON.stringify(expectedValue),
                'PX',
                updateFrequencyMilliseconds,
            );

            expect(result).toStrictEqual(expectedValue);
        });
    });
});
