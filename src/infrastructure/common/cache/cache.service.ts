import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    try {
      const result = await this.cacheManager.get<T>(key);
      return result;
    } catch (error) {
      this.logger.error(`Failed to get cache for key: ${key}`, error.stack);
      return undefined;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
      this.logger.debug(`Successfully set cache for key: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to set cache for key: ${key}`, error.stack);
      // Don't throw error to avoid breaking the application flow
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      this.logger.debug(`Successfully deleted cache for key: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete cache for key: ${key}`, error.stack);
    }
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      // Type assertion to access Redis store methods
      const cacheManager = this.cacheManager as any;
      if (cacheManager.store && cacheManager.store.keys) {
        const keys = await cacheManager.store.keys(pattern);
        if (keys.length > 0) {
          await Promise.all(
            keys.map((key: string) => this.cacheManager.del(key)),
          );
          this.logger.debug(
            `Successfully deleted ${keys.length} keys matching pattern: ${pattern}`,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to delete cache pattern: ${pattern}`,
        error.stack,
      );
    }
  }
}
