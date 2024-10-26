import { TCompanyModule } from '@modules/tcompany/tcompany.module';
import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { RedisModule } from '@libs/redis';
import { RabbitModule } from '@libs/rabbit';

@Module({
  imports: [RedisModule, RabbitModule, TCompanyModule],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
