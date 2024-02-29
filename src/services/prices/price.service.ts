import moment from 'moment';
import { PriceRepository } from '../../domain/repositories/price.repository';
import { PriceEntity } from './price.entities';
import { PriceServiceFindParams } from './price.interfaces';
import Redis from 'ioredis';
import { BaseService } from '../base.service';

export class PricesService extends BaseService {
    constructor(
        private repository: PriceRepository,
        private redis: Redis,
        private updateFrequencyMilliseconds: number,
    ) {
        super();
    }

    async findWithCommission(
        params: PriceServiceFindParams,
    ): Promise<PriceEntity> {
        const cacheKey = this.buildCacheName('findWithCommission', params);
        const cachedData = await this.redis.get(cacheKey);

        if (cachedData) {
            return JSON.parse(cachedData);
        }

        const result = await this.repository.find(params);

        const commission = params.params.commissionPercent;
        const askPrice = this.applyCommission(result.askPrice, commission);
        const bidPrice = this.applyCommission(result.bidPrice, commission);

        const data = {
            price: (askPrice + bidPrice) / 2, // an average price
            lastUpdated: moment().toISOString(),
        };

        await this.redis.set(
            cacheKey,
            JSON.stringify(data),
            'PX',
            this.updateFrequencyMilliseconds,
        );

        return data;
    }

    private applyCommission(price: number, commissionPercent: number): number {
        return (price * commissionPercent) / 100 + price;
    }
}
