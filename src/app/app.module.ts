import { Module } from '@nestjs/common';
import { ConfigModule } from '@libs/config';
import { pinoDefaultConfig } from '@libs/logger';
import { LoggerModule } from 'nestjs-pino';
import { BookingModule } from '@modules/booking';

@Module({
  imports: [
    ConfigModule,
    LoggerModule.forRootAsync(pinoDefaultConfig),
    BookingModule,
  ],
})
export class AppModule {}
