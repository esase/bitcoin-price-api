import { PriceEntity } from '../../../domain/entities/price.entity';
import { PriceRepository } from '../../../domain/repositories/price.repository';
import { PriceRepositoryFindParams } from '../../../domain/repositories/price.repository.interfaces';
import { Axios } from 'axios';

export class PriceHttpBinanceRepository extends PriceRepository {
    private readonly url = 'https://binance.com/api/v3/ticker/bookTicker?';

    constructor(private axios: Axios) {
        super();
    }

    async find(params: PriceRepositoryFindParams): Promise<PriceEntity> {
        const response = await this.axios.get<{
            symbol: string;
            bidPrice: string;
            bidQty: string;
            askPrice: string;
            askQty: string;
        }>(
            `${this.url}symbol=${params.filters.symbolFrom}${params.filters.symbolTo}`,
        );

        return {
            symbol: response.data.symbol,
            bidPrice: Number(response.data.bidPrice),
            bidQty: Number(response.data.bidQty),
            askPrice: Number(response.data.askPrice),
            askQty: Number(response.data.askQty),
        };
    }
}
