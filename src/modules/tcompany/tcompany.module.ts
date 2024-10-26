import { Module } from '@nestjs/common';
import { TCompanyService } from './tcompany.service';

@Module({
  providers: [TCompanyService],
  exports: [TCompanyService],
})
export class TCompanyModule {}
