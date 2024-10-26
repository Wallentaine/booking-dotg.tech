import { TCompanyModule } from '@modules/tcompany/tcompany.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [TCompanyModule],
  controllers: [],
  providers: [],
})
export class BookingModule {}
