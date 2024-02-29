import { PriceEntity } from '../entities/price.entity';
import { PriceRepositoryFindParams } from './price.repository.interfaces';

export abstract class PriceRepository {
    abstract find(params: PriceRepositoryFindParams): Promise<PriceEntity>;
}
