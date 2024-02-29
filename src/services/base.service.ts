export abstract class BaseService {
    buildCacheName(...args: unknown[]): string {
        return this.constructor.name + JSON.stringify(args);
    }
}
