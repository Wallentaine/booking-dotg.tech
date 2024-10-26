import { ConfigSchema } from '@libs/config';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

export const redisConfig = CacheModule.registerAsync({
  inject: [ConfigSchema],
  useFactory: (config: ConfigSchema) => ({
    store: redisStore,
    url: config.redis.connectionString,
  }),
});
