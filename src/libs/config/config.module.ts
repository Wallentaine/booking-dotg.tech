import { fileLoader, selectConfig, TypedConfigModule } from 'nest-typed-config';
import { ConfigSchema } from './config.schema';

export const ConfigModule = TypedConfigModule.forRoot({
  schema: ConfigSchema,
  load: [
    fileLoader({
      basename: 'default',
      searchFrom: `${process.cwd()}/config`,
    }),
    () => ({
      NODE_ENV: process.env.NODE_ENV || 'development',
    }),
  ],
  isGlobal: true,
});

export const Config = selectConfig(ConfigModule, ConfigSchema);
