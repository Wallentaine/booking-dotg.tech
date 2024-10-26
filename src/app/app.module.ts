import { ConfigModule } from '@libs/config';
import { pinoDefaultConfig } from '@libs/logger';
import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [ConfigModule, , LoggerModule.forRootAsync(pinoDefaultConfig)],
})
export class AppModule {}