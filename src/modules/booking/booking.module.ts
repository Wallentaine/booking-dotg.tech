import { TCompanyModule } from '@modules/tcompany/tcompany.module';
import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { RedisModule } from '@libs/redis';

@Module({
  imports: [RedisModule, TCompanyModule],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
