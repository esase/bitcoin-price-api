import { PriceRepositoryFindParams } from '../../domain/repositories/price.repository.interfaces';

export type PriceServiceFindParams = PriceRepositoryFindParams & {
    params: {
        commissionPercent: number;
    };
};
